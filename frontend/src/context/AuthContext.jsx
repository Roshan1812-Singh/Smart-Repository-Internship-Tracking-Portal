import { createContext, useContext, useEffect, useState } from "react";
import API from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser && storedUser !== "undefined") {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Invalid user data in localStorage");
      localStorage.removeItem("user");
    }

    setLoading(false);
  }, []);

  const login = (data) => {
    try {
      const userData = data.user || data;
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error("Error saving user to localStorage");
    }
  };

  const logout = async () => {
    try {
      const refreshToken =
        localStorage.getItem("refreshToken") ||
        sessionStorage.getItem("refreshToken");

      if (refreshToken) {
        await API.post("/auth/logout", { refreshToken });
        console.log("✅ Backend logout successful");
      }
    } catch (error) {
      console.warn("Logout API failed (non-critical):", error.message);
    }

    // Clear storage + state
    localStorage.removeItem("user");
    localStorage.removeItem("refreshToken");
    sessionStorage.removeItem("refreshToken");
    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);