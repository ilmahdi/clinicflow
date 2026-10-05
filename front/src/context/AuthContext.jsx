import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContextInstance.js';
import { authService } from '../services/auth.service.js';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearAuth = () => {
    setUser(null);
  };

  useEffect(() => {
    const handleExpired = () => {
      clearAuth();
    };
    window.addEventListener('clinicflow:session-expired', handleExpired);
    return () => window.removeEventListener('clinicflow:session-expired', handleExpired);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      try {
        const profile = await authService.getMe();
        if (isMounted) {
          setUser(profile);
        }
      } catch {
        if (isMounted) {
          clearAuth();
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // In case network fails, still clear local session state
    } finally {
      clearAuth();
    }
  };

  const value = {
    user,
    token: null,
    loading,
    login,
    logout,
    isAdmin: user?.role === 'admin',
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
