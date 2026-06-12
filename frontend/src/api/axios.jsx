import axios from "axios";
import { API_BASE } from "../config";

const API = axios.create({
  baseURL: API_BASE,
  // Hard cap so a slow/dead backend can never hang the UI forever.
  timeout: 30000,
});

// Bare client used ONLY for the refresh call. It has no interceptors, so a
// failing refresh can never re-enter this logic and deadlock the queue.
const refreshClient = axios.create({ baseURL: API_BASE, timeout: 30000 });

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

const getRefreshToken = () =>
  localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");

const clearSessionAndRedirect = () => {
  localStorage.clear();
  sessionStorage.clear();
  if (!window.location.pathname.startsWith("/login")) {
    window.location.href = "/login";
  }
};

API.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// Never attempt a token refresh for these endpoints (their 401 is meaningful).
const AUTH_PATHS = ["/auth/login", "/auth/register", "/auth/refresh", "/auth/forgot", "/auth/reset"];

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const status = error.response?.status;
    const url = originalRequest.url || "";
    const isAuthPath = AUTH_PATHS.some((p) => url.includes(p));

    if (status === 401 && !originalRequest._retry && !isAuthPath) {
      // A refresh is already in flight — queue this request until it finishes.
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return API(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) throw new Error("No refresh token found");

        const res = await refreshClient.post("/auth/refresh", { refreshToken });
        const newAccessToken = res.data.accessToken;
        const newRefreshToken = res.data.refreshToken;

        const storage = localStorage.getItem("refreshToken")
          ? localStorage
          : sessionStorage;
        storage.setItem("accessToken", newAccessToken);
        if (newRefreshToken) storage.setItem("refreshToken", newRefreshToken);

        API.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return API(originalRequest);
      } catch (err) {
        processQueue(err, null);
        clearSessionAndRedirect();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    if (status === 403) {
      console.error(
        "🚫 403 Forbidden:",
        error.response?.data?.message || "Access denied for your role",
      );
      clearSessionAndRedirect();
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);

export default API;
