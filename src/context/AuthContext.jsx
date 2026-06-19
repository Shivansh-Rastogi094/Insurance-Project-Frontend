import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(() => {
    const savedUser = localStorage.getItem("userData");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (data) => {
    setUserData(data);
    localStorage.setItem("userData", JSON.stringify(data));
    localStorage.setItem("token", data.token);
  };

  const logout = () => {
    setUserData(null);
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
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
