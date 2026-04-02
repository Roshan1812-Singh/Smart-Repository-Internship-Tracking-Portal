import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../services/authService";
import { toast } from "react-hot-toast";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const urlToken = searchParams.get("token");
    const urlEmail = searchParams.get("email");
    if (urlToken && urlEmail) {
      setToken(urlToken);
      setEmail(decodeURIComponent(urlEmail));
      setIsValid(true);
    } else {
      setMessage("Invalid or missing reset link.");
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ token, email, password });
      toast.success("Password reset successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const msg = err.response?.data?.message || "Reset failed. Link may be invalid/expired.";
      toast.error(msg);
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isValid) {
    return (
      <div className="min-h-screen bg-gradient-primary dark:bg-gradient-secondary flex items-center justify-center p-4">
        <div className="bg-white/95 dark:bg-gray-500/95 p-8 rounded-2xl shadow-2xl max-w-md w-full backdrop-blur-md">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Invalid Reset Link</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          <button
            onClick={() => navigate("/forgot-password")}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Request New Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary dark:bg-gradient-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/95 dark:bg-gray-500/95 p-8 rounded-2xl shadow-2xl backdrop-blur-md">
        <h2 className="text-4xl font-bold mb-4 text-gray-900">Reset Password</h2>
        <p className="text-sm text-gray-600 mb-6">Enter new password for {email}</p>
        {message && <p className="mb-4 p-3 bg-orange-100 text-orange-800 rounded-lg text-sm">{message}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            readOnly
            className="w-full p-3 rounded-lg border bg-gray-100 cursor-not-allowed"
            placeholder="Email"
          />
          <input
            type="password"
            placeholder="New Password"
            className="w-full p-3 rounded-lg border"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            className="w-full p-3 rounded-lg border"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          <button
            onClick={() => navigate("/login")}
            className="text-blue-600 hover:underline"
          >
            Back to Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
