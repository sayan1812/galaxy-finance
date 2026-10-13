import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '../types';
import api from '../services/apiClient';

import { 
  auth,
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
  loading: boolean;
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
  deleteMyAccount: (password?: string) => Promise<any>;
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

export function clearPreviousSessionCache() {
  if (typeof window === 'undefined') return;
  const keysToRemove = [
    'cached_accounts',
    'rupeewise_banks_v2',
    'rupeewise_transactions_v2',
    'rupeewise_cash_wallet_v2',
    'rupeewise_budgets_v2',
    'rupeewise_recurring_v2',
    'galaxy_custom_categories',
    'rupeewise_connected_accounts_v1',
  ];
  keysToRemove.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  });
  window.dispatchEvent(new CustomEvent('auth:session-cleared'));
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token') || localStorage.getItem('galaxy_token') || localStorage.getItem('rupeewise_token');
      if (!token || isJwtExpired(token)) {
        localStorage.removeItem('token');
        localStorage.removeItem('galaxy_token');
        localStorage.removeItem('rupeewise_token');
        localStorage.removeItem('rupeewise_user');
        return null;
      }
      const saved = localStorage.getItem('rupeewise_user');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (auth.currentUser?.photoURL && !parsed.photoURL) {
            parsed.photoURL = auth.currentUser.photoURL;
            parsed.avatarUrl = auth.currentUser.photoURL;
          }
          return parsed;
        } catch { return null; }
      }
    }
    return null;
  });
  const [authState, setAuthState] = useState<AuthState>(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token') || localStorage.getItem('galaxy_token') || localStorage.getItem('rupeewise_token');
      const saved = localStorage.getItem('rupeewise_user');
      if (token && !isJwtExpired(token) && saved) {
        return 'AUTHENTICATED';
      }
      if (!token) {
        return 'UNAUTHENTICATED';
      }
    }
    return 'INITIALIZING';
  });
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
      // Race api.getMe with a 3.5s timeout so user is never frozen on splash screen
      const timeoutPromise = new Promise<{ user: any }>((_, reject) =>
        setTimeout(() => reject(new Error('Auth verification timeout')), 3500)
      );
      const data = await Promise.race([api.getMe(), timeoutPromise]);
      if (data?.user) {
        const fbPhoto = auth.currentUser?.photoURL;
        const enrichedUser: User = {
          ...data.user,
          displayName: data.user.displayName || data.user.name || auth.currentUser?.displayName,
          photoURL: fbPhoto || data.user.photoURL || data.user.avatarUrl,
          avatarUrl: fbPhoto || data.user.avatarUrl || data.user.photoURL
        };
        setUser(enrichedUser);
        localStorage.setItem('rupeewise_user', JSON.stringify(enrichedUser));
        setAuthState('AUTHENTICATED');
      } else {
        setUser(null);
        localStorage.removeItem('rupeewise_user');
        setAuthState('UNAUTHENTICATED');
      }
    } catch (err) {
      console.warn('[Auth]: Verification deferred/timed out:', err);
      const savedUser = localStorage.getItem('rupeewise_user');
      if (savedUser && token && !isJwtExpired(token)) {
        try {
          setUser(JSON.parse(savedUser));
          setAuthState('AUTHENTICATED');
          return;
        } catch {
          // ignore parse error
        }
      }
      setUser(null);
      setAuthState('UNAUTHENTICATED');
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Listen for Firebase auth state changes & synchronize with MongoDB
  useEffect(() => {
    const unsubscribe = onFirebaseAuthStateChanged(async (fbUser) => {
      if (fbUser) {
        try {
          const idToken = await fbUser.getIdToken();
          const syncRes = await api.googleSync({
            email: fbUser.email || '',
            name: fbUser.displayName || undefined,
            photoURL: fbUser.photoURL || undefined,
            uid: fbUser.uid,
            idToken,
          });
          const appUser: User = {
            id: syncRes.user?.id || fbUser.uid,
            name: syncRes.user?.name || fbUser.displayName || fbUser.email?.split('@')[0] || 'Executive User',
            displayName: fbUser.displayName || syncRes.user?.name || fbUser.email?.split('@')[0] || 'Executive User',
            email: fbUser.email || '',
            emailVerified: fbUser.emailVerified,
            phoneVerified: false,
            avatarUrl: fbUser.photoURL || syncRes.user?.avatarUrl || undefined,
            photoURL: fbUser.photoURL || syncRes.user?.avatarUrl || undefined
          };
          clearPreviousSessionCache();
          setUser(appUser);
          localStorage.setItem('rupeewise_user', JSON.stringify(appUser));
          setAuthState('AUTHENTICATED');
          window.dispatchEvent(new CustomEvent('auth:user-changed', { detail: { user: appUser } }));
        } catch {
          // fallback
        }
      }
    });

    const handleUnauthorized = () => {
      clearPreviousSessionCache();
      setUser(null);
      setAuthState('UNAUTHENTICATED');
      window.dispatchEvent(new CustomEvent('auth:user-changed', { detail: { user: null } }));
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      unsubscribe();
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (identifier: string, password: string, rememberMe = true) => {
    setAuthState('AUTHENTICATING');
    try {
      clearPreviousSessionCache();
      const data = await api.login(identifier, password, rememberMe);
      const enrichedUser: User = {
        ...data.user,
        displayName: data.user.displayName || data.user.name || auth.currentUser?.displayName,
        photoURL: data.user.photoURL || data.user.avatarUrl || auth.currentUser?.photoURL,
        avatarUrl: data.user.avatarUrl || data.user.photoURL || auth.currentUser?.photoURL
      };
      setUser(enrichedUser);
      localStorage.setItem('rupeewise_user', JSON.stringify(enrichedUser));
      setAuthState('AUTHENTICATED');
      setIsAuthModalOpen(false);
      window.dispatchEvent(new CustomEvent('auth:user-changed', { detail: { user: enrichedUser } }));
    } catch (err) {
      setAuthState('UNAUTHENTICATED');
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    setAuthState('AUTHENTICATING');
    try {
      clearPreviousSessionCache();
      const { user: fbUser, token: fbToken } = await signInWithGoogle();
      const syncRes = await api.googleSync({
        email: fbUser.email || '',
        name: fbUser.displayName || undefined,
        photoURL: fbUser.photoURL || undefined,
        uid: fbUser.uid,
        idToken: fbToken,
      });
      const appUser: User = {
        id: syncRes.user?.id || fbUser.uid,
        name: syncRes.user?.name || fbUser.displayName || fbUser.email?.split('@')[0] || 'Executive User',
        displayName: fbUser.displayName || syncRes.user?.name || fbUser.email?.split('@')[0] || 'Executive User',
        email: fbUser.email || '',
        emailVerified: fbUser.emailVerified,
        phoneVerified: false,
        avatarUrl: fbUser.photoURL || syncRes.user?.avatarUrl || undefined,
        photoURL: fbUser.photoURL || syncRes.user?.avatarUrl || undefined
      };
      setUser(appUser);
      localStorage.setItem('rupeewise_user', JSON.stringify(appUser));
      setAuthState('AUTHENTICATED');
      setIsAuthModalOpen(false);
      window.dispatchEvent(new CustomEvent('auth:user-changed', { detail: { user: appUser } }));
    } catch (err: any) {
      setAuthState('UNAUTHENTICATED');
      throw err;
    }
  };

  const register = async (formData: { name: string; email: string; phone?: string; password: string; confirmPassword: string }) => {
    setAuthState('AUTHENTICATING');
    try {
      clearPreviousSessionCache();
      const data = await api.register(formData);
      setUser(data.user);
      localStorage.setItem('rupeewise_user', JSON.stringify(data.user));
      setAuthState('AUTHENTICATED');
      setAuthModalMode('verify-email');
      window.dispatchEvent(new CustomEvent('auth:user-changed', { detail: { user: data.user } }));
      return data;
    } catch (err) {
      setAuthState('UNAUTHENTICATED');
      throw err;
    }
  };

  const logout = async () => {
    clearPreviousSessionCache();
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
    window.dispatchEvent(new CustomEvent('auth:user-changed', { detail: { user: null } }));
  };

  const deleteMyAccount = async (password?: string) => {
    clearPreviousSessionCache();
    try {
      await api.deleteMyAccount(password);
    } catch {
      // continue local cleanup
    }
    try {
      await logOutFromFirebase();
    } catch {
      // continue local cleanup
    }
    api.setToken(null);
    setUser(null);
    localStorage.removeItem('rupeewise_user');
    localStorage.removeItem('rupeewise_token');
    setAuthState('UNAUTHENTICATED');
    window.dispatchEvent(new CustomEvent('auth:user-changed', { detail: { user: null } }));
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
        loading: isLoading,
        isFirebaseAvailable,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        login,
        loginWithGoogle,
        register,
        logout,
        deleteMyAccount,
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

export const useOptionalAuth = () => {
  return useContext(AuthContext);
};
