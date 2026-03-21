import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]           = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState(null);

  // Restore session on mount
  useEffect(() => {
    const token    = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('userData');
    if (token && userData) {
      try { setUser(JSON.parse(userData)); }
      catch { localStorage.clear(); }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (credentials) => {
    setError(null);
    try {
      const res  = await authAPI.login(credentials);
      const data = res.data;
      localStorage.setItem('accessToken',  data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      const userData = {
        id:       data.userId,
        username: data.username,
        role:     data.role,
        name:     data.name,
        memberId: data.memberId,
        gymId:    data.gymId,
      };
      localStorage.setItem('userData', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid credentials. Please try again.';
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) await authAPI.logout(token);
    } catch { /* ignore */ }
    finally {
      localStorage.clear();
      setUser(null);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    login,
    logout,
    clearError,
    isSuperUser:    user?.role === 'SUPER_USER',
    isAdmin:        ['SUPER_USER', 'ADMIN'].includes(user?.role),
    isManager:      ['SUPER_USER', 'ADMIN', 'MANAGER'].includes(user?.role),
    isReceptionist: ['SUPER_USER', 'ADMIN', 'MANAGER', 'RECEPTIONIST'].includes(user?.role),
    isTrainer:      user?.role === 'TRAINER',
    isMember:       user?.role === 'MEMBER',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
