import React, { createContext, useEffect, useState } from 'react';
import { setToken, getToken, setUser, getUser, logout as authLogout } from '../services/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getToken());
  const [user, setUserState] = useState(getUser() || {});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is authenticated on component mount
    const token = getToken();
    if (token) {
      setIsAuthenticated(true);
      setUserState(getUser() || {});
    }
  }, []);

  const login = (token, userData) => {
    setToken(token);
    setUser(userData);
    setIsAuthenticated(true);
    setUserState(userData);
  };

  const logout = () => {
    authLogout();
    setIsAuthenticated(false);
    setUserState({});
  };

  const updateUser = (userData) => {
    setUser(userData);
    setUserState(userData);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        login,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
