import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/forgot", { email });
      setMessage("If that email is registered, a reset link has been sent.");
    } catch (err) {
      setMessage("Failed to send reset link. Try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-primary dark:bg-gradient-secondary flex items-center justify-center bg-gray-900">
      <div className="w-full max-w-md bg-white/95 dark:bg-gray-500/95 p-8 rounded-2xl shadow-2xl backdrop-blur-md">
        <h2 className="text-4xl font-bold mb-4 text-gray-900">Forgot Password</h2>
        {message && <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">{message}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Your registered email"
            className="w-full p-3 rounded-lg border bg-gray-200"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-800 transition"
          >
            Send Reset Link
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-white">
          Remembered?{' '}
          <span
            onClick={() => navigate('/login')}
            className="text-black text-bold cursor-pointer underline"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
