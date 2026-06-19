// Single source of truth for reading the stored user.
//
// Historically the login pages saved the WRONG shape into localStorage:
//   { accessToken, refreshToken, user }
// while every component read it as the plain user object (user.role, user.name).
// That mismatch made role detection fail (kicked to /login on refresh) and showed
// "Welcome, undefined". We now store the plain user object, but this helper still
// unwraps the legacy shape so existing logged-in sessions keep working.
export const getStoredUser = () => {
  try {
    const raw =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    if (!raw || raw === "undefined" || raw === "null") return null;

    const parsed = JSON.parse(raw);
    if (!parsed) return null;

    // Legacy wrapper { accessToken, refreshToken, user } -> return the inner user.
    if (parsed.user && (parsed.accessToken || parsed.refreshToken)) {
      return parsed.user;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const getAccessToken = () =>
  localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");

export const clearSession = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("refreshToken");
};
