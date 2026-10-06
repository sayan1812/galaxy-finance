import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '../types';
import api from '../services/apiClient';

import { 
  signInWithGoogle, 
  logOutFromFirebase,
  onFirebaseAuthStateChanged,
  isFirebaseConfigured
} from '../config/firebase';

export type AuthState = 'INITIALIZING' | 'UNAUTHENTICATED' | 'AUTHENTICATING' | 'AUTHENTICATED';

interface AuthContextType {
  user: User | null;
  authState: AuthState;
  isAuthenticated: boolean;
  isLoading: boolean;
  isFirebaseAvailable: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'register' | 'verify-email' | 'verify-phone' | 'forgot-password';
  setAuthModalMode: (mode: 'login' | 'register' | 'verify-email' | 'verify-phone' | 'forgot-password') => void;
  login: (identifier: string, password: string, rememberMe?: boolean) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
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

// Helper to inspect JWT expiry client-side
function isJwtExpired(token: string | null): boolean {
  if (!token) return true;
  if (!token.includes('.')) return false; // Non-JWT opaque token
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp && typeof payload.exp === 'number') {
      return Date.now() >= payload.exp * 1000;
    }
  } catch {
    return false;
  }
  return false;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rupeewise_user');
      if (saved) {
        try { return JSON.parse(saved); } catch { return null; }
      }
    }
    return null;
  });
  const [authState, setAuthState] = useState<AuthState>('INITIALIZING');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'verify-email' | 'verify-phone' | 'forgot-password'>('login');

  const refreshUser = useCallback(async () => {
    const token = api.getToken();
    if (!token) {
      setUser(null);
      localStorage.removeItem('rupeewise_user');
      setAuthState('UNAUTHENTICATED');
      return;
    }

    if (isJwtExpired(token)) {
      api.setToken(null);
      setUser(null);
      localStorage.removeItem('rupeewise_user');
      setAuthState('UNAUTHENTICATED');
      return;
    }

    try {
      const data = await api.getMe();
      if (data?.user) {
        setUser(data.user);
        localStorage.setItem('rupeewise_user', JSON.stringify(data.user));
        setAuthState('AUTHENTICATED');
      } else {
        setUser(null);
        localStorage.removeItem('rupeewise_user');
        setAuthState('UNAUTHENTICATED');
      }
    } catch {
      api.setToken(null);
      setUser(null);
      localStorage.removeItem('rupeewise_user');
      setAuthState('UNAUTHENTICATED');
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onFirebaseAuthStateChanged(async (fbUser) => {
      if (fbUser) {
        try {
          const idToken = await fbUser.getIdToken();
          api.setToken(idToken);
          const appUser: User = {
            id: fbUser.uid,
            name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Executive User',
            email: fbUser.email || '',
            emailVerified: fbUser.emailVerified,
            phoneVerified: false,
            avatarUrl: fbUser.photoURL || undefined
          };
          setUser(appUser);
          localStorage.setItem('rupeewise_user', JSON.stringify(appUser));
          setAuthState('AUTHENTICATED');
        } catch {
          // fallback to existing flow
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const login = async (identifier: string, password: string, rememberMe = true) => {
    setAuthState('AUTHENTICATING');
    try {
      const data = await api.login(identifier, password, rememberMe);
      setUser(data.user);
      localStorage.setItem('rupeewise_user', JSON.stringify(data.user));
      setAuthState('AUTHENTICATED');
      setIsAuthModalOpen(false);
    } catch (err) {
      setAuthState('UNAUTHENTICATED');
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    setAuthState('AUTHENTICATING');
    try {
      const { user: fbUser, token } = await signInWithGoogle();
      const appUser: User = {
        id: fbUser.uid,
        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Executive User',
        email: fbUser.email || '',
        emailVerified: fbUser.emailVerified,
        phoneVerified: false,
        avatarUrl: fbUser.photoURL || undefined
      };
      api.setToken(token);
      setUser(appUser);
      localStorage.setItem('rupeewise_user', JSON.stringify(appUser));
      setAuthState('AUTHENTICATED');
      setIsAuthModalOpen(false);
    } catch (err: any) {
      setAuthState('UNAUTHENTICATED');
      throw err;
    }
  };

  const register = async (formData: { name: string; email: string; phone?: string; password: string; confirmPassword: string }) => {
    setAuthState('AUTHENTICATING');
    try {
      const data = await api.register(formData);
      setUser(data.user);
      localStorage.setItem('rupeewise_user', JSON.stringify(data.user));
      setAuthState('AUTHENTICATED');
      setAuthModalMode('verify-email');
      return data;
    } catch (err) {
      setAuthState('UNAUTHENTICATED');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Continue cleanup
    }
    try {
      await logOutFromFirebase();
    } catch {
      // Continue cleanup
    }
    api.setToken(null);
    setUser(null);
    localStorage.removeItem('rupeewise_user');
    setAuthState('UNAUTHENTICATED');
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

  const isAuthenticated = authState === 'AUTHENTICATED' && Boolean(user);
  const isLoading = authState === 'INITIALIZING' || authState === 'AUTHENTICATING';
  const isFirebaseAvailable = isFirebaseConfigured();

  return (
    <AuthContext.Provider
      value={{
        user,
        authState,
        isAuthenticated,
        isLoading,
        isFirebaseAvailable,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        login,
        loginWithGoogle,
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
