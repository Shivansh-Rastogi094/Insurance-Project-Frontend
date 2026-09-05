import React, { createContext, useState, useContext } from 'react';
import { LogoutService } from "../services/AuthService";

const AuthContext = createContext(null);

// Helper: decode JWT payload and check expiry (client-side, no verification)
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    const { exp } = JSON.parse(jsonPayload);
    if (!exp) return false;
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
};

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(() => {
    const savedUser = localStorage.getItem("userData");
    const token = localStorage.getItem("token");
    // BUG-023 fix: If token is expired on load, clear stored session
    if (savedUser && isTokenExpired(token)) {
      localStorage.removeItem("userData");
      localStorage.removeItem("token");
      return null;
    }
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (data) => {
    setUserData(data);
    localStorage.setItem("userData", JSON.stringify(data));
    localStorage.setItem("token", data.token);
  };

  const logout = async () => {
    try {
      if (localStorage.getItem("token")) {
        await LogoutService();
      }
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      setUserData(null);
      localStorage.removeItem("userData");
      localStorage.removeItem("token");
    }
  };

  return (
    <AuthContext.Provider value={{ userData, login, logout, isAuthenticated: !!userData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
