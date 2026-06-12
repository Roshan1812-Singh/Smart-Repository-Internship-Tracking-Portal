import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loginUser } from "../services/authService";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/authSlice";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { login: contextLogin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("student");
  const [fixedRole, setFixedRole] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const r = params.get("role");
    if (r === "admin") {
      setRole("admin");
      setFixedRole(true);
    }
  }, [location.search]);

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("🔐 Login attempt:", {
        email: email.trim().toLowerCase(),
        role,
      });

      const res = await loginUser({
        email: email.trim().toLowerCase(),
        password,
        role,
      });

      console.log("✅ Login API success:", res.data);

      const { accessToken, refreshToken, user } = res.data;

      console.log("👤 User data:", user);

      const storage = remember ? localStorage : sessionStorage;
      storage.setItem("accessToken", accessToken);
      storage.setItem("refreshToken", refreshToken);
      storage.setItem(
        "user",
        JSON.stringify({ accessToken, refreshToken, user }),
      );

      const verifyUser = JSON.parse(storage.getItem("user"));
      const verifyToken = storage.getItem("accessToken");
      console.log("💾 Storage verified:", {
        hasToken: !!verifyToken,
        userRole: verifyUser?.role,
      });

      dispatch(setUser(user));
      contextLogin({ accessToken, refreshToken, user });

      if (user.role === "admin" || user.role === "superadmin") {
        navigate("/admin", { replace: true });
      } else if (user.role === "student") {
        navigate("/student", { replace: true });
      } else if (user.role === "mentor") {
        navigate("/mentor", { replace: true });
      }
    } catch (err) {
      console.error("❌ Login error:", err.response?.data || err.message);
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Login failed. Check browser console for details.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 dark:bg-gradient-secondary flex items-center justify-center">
      <div className="w-full max-w-md bg-white/95 dark:bg-gray-900/95 p-8 rounded-2xl shadow-2xl backdrop-blur-md">
        <h2 className="text-3xl font-bold mb-2 text-center text-gray-300">
          Welcome
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-6 text-sm">
          Log in to your account
        </p>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="flex gap-2">
            {fixedRole ? (
              <div className="flex-1 py-2 rounded-lg text-sm font-medium bg-primary text-white text-center ">
                Admin
              </div>
            ) : (
              ["student", "mentor"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex-1 py-2 rounded-lg hover:cursor-pointer text-sm  text-white font-medium transition ${
                    role === r
                      ? "bg-blue-600 text-black"
                      : "bg-gray-200 dark:bg-blue-900"
                  }`}
                >
                  {r}
                </button>
              ))
            )}
          </div>

          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 rounded-lg border dark:bg-gray-800 text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full p-3 pr-12 rounded-lg border dark:bg-gray-800 text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:cursor-pointer"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <div className="flex justify-between text-sm">
            <label className="flex items-center gap-2 text-white">
              <input
                type="checkbox"
                checked={remember}
                onChange={() => setRemember(!remember)}
              />
              Remember me
            </label>

            <span
              onClick={() => navigate("/forgot-password")}
              className="text-primary underline cursor-pointer text-white"
            >
              Forgot Password?
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg transition hover:bg-primary-dark hover:cursor-pointer"
          >
            {loading ? "Logging In..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
