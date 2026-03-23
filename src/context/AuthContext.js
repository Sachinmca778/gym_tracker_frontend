import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export const ROLES = {
  SUPER_USER: 'SUPER_USER',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  RECEPTIONIST: 'RECEPTIONIST',
  TRAINER: 'TRAINER',
  MEMBER: 'MEMBER',
  GUEST: 'GUEST',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from storage on mount
  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    if (stored && token) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.clear();
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (credentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await authAPI.login(credentials);
      // Backend returns: accessToken, refreshToken, userId, username, role, name, memberId, gymId
      const userData = {
        id: data.userId,
        username: data.username,
        role: data.role,
        name: data.name,
        memberId: data.memberId,
        gymId: data.gymId,
      };
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    try {
      if (token) await authAPI.logout(token);
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if API call fails
    } finally {
      localStorage.clear();
      setUser(null);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const hasRole = useCallback((...roles) => {
    return roles.includes(user?.role);
  }, [user]);

  const isAdmin = hasRole(ROLES.SUPER_USER, ROLES.ADMIN);
  const isManager = hasRole(ROLES.SUPER_USER, ROLES.ADMIN, ROLES.MANAGER);
  const isStaff = hasRole(ROLES.SUPER_USER, ROLES.ADMIN, ROLES.MANAGER, ROLES.RECEPTIONIST);
  const isMember = hasRole(ROLES.MEMBER);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      error,
      isAuthenticated: !!user,
      login,
      logout,
      clearError,
      hasRole,
      isAdmin,
      isManager,
      isStaff,
      isMember,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
