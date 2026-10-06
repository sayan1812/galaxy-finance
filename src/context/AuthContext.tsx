import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '../types';
import api from '../services/apiClient';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'register' | 'verify-email' | 'verify-phone' | 'forgot-password';
  setAuthModalMode: (mode: 'login' | 'register' | 'verify-email' | 'verify-phone' | 'forgot-password') => void;
  login: (identifier: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (data: { name: string; email: string; phone?: string; password: string; confirmPassword: string }) => Promise<any>;
  logout: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  sendVerificationEmail: () => Promise<any>;
  sendOtp: (phone?: string) => Promise<any>;
  verifyOtp: (otp: string) => Promise<void>;
  forgotPassword: (identifier: string) => Promise<any>;
  resetPassword: (data: any) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'verify-email' | 'verify-phone' | 'forgot-password'>('login');

  const refreshUser = useCallback(async () => {
    try {
      const data = await api.getMe();
      if (data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (identifier: string, password: string, rememberMe = true) => {
    const data = await api.login(identifier, password, rememberMe);
    setUser(data.user);
    setIsAuthModalOpen(false);
  };

  const register = async (formData: { name: string; email: string; phone?: string; password: string; confirmPassword: string }) => {
    const data = await api.register(formData);
    setUser(data.user);
    setAuthModalMode('verify-email');
    return data;
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
    }
  };

  const verifyEmail = async (token: string) => {
    await api.verifyEmail(token);
    await refreshUser();
  };

  const sendVerificationEmail = async () => {
    return api.sendVerificationEmail();
  };

  const sendOtp = async (phone?: string) => {
    return api.sendOtp(phone);
  };

  const verifyOtp = async (otp: string) => {
    await api.verifyOtp(otp);
    await refreshUser();
  };

  const forgotPassword = async (identifier: string) => {
    return api.forgotPassword(identifier);
  };

  const resetPassword = async (data: any) => {
    await api.resetPassword(data);
    setAuthModalMode('login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        login,
        register,
        logout,
        verifyEmail,
        sendVerificationEmail,
        sendOtp,
        verifyOtp,
        forgotPassword,
        resetPassword,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
