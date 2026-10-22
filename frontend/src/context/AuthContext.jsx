import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check current session on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await api.get('/api/auth/me');
      if (res.success && res.data) {
        setUser(res.data);
        return res.data;
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
    return null;
  };

  const login = async (identifier, password, loginMode = 'STUDENT') => {
    setError(null);
    try {
      const res = await api.post('/api/auth/login', { identifier, password, loginMode });
      if (res.success && res.data) {
        setUser(res.data);
        return res.data;
      }
      throw new Error(res.message || 'Login failed');
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (formData) => {
    setError(null);
    try {
      const res = await api.post('/api/auth/register', formData);
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      setUser(null);
    }
  };

  const updateUserProfile = (updatedUser) => {
    setUser(updatedUser);
  };

  const refreshUser = async () => {
    return await checkAuth();
  };

  const isPending = user?.role === 'STUDENT' && user?.approvalStatus === 'PENDING';
  const isApproved = user?.approvalStatus === 'APPROVED';

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role,
        approvalStatus: user?.approvalStatus,
        isPending,
        isApproved,
        isAuthenticated: !!user,
        loading,
        error,
        login,
        register,
        logout,
        updateUserProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
