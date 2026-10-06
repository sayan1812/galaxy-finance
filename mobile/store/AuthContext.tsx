import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import { 
  getAuthToken, 
  saveAuthToken, 
  removeAuthToken, 
  isBiometricEnabled as checkStorageBiometrics, 
  setBiometricEnabled as saveStorageBiometrics 
} from '../services/storage';
import { checkBiometricStatus, authenticateWithBiometrics } from '../services/biometricService';
import { registerForPushNotifications } from '../services/notificationService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isBiometricSupported: boolean;
  biometricType: string;
  isBiometricActive: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (name: string, email: string, phone: string, password: string) => Promise<string>;
  logout: () => Promise<void>;
  sendEmailVerification: () => Promise<string>;
  verifyEmail: (token: string) => Promise<boolean>;
  sendPhoneOtp: () => Promise<number>;
  verifyPhoneOtp: (otp: string) => Promise<boolean>;
  forgotPassword: (identifier: string) => Promise<string>;
  resetPassword: (identifier: string, otp: string, newPass: string) => Promise<boolean>;
  toggleBiometrics: (enable: boolean) => Promise<boolean>;
  unlockWithBiometrics: () => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as any);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [biometricType, setBiometricType] = useState('Biometrics');
  const [isBiometricActive, setIsBiometricActive] = useState(false);

  // Check hardware biometric capability & stored token on mount
  useEffect(() => {
    async function initAuth() {
      try {
        const bioStatus = await checkBiometricStatus();
        setIsBiometricSupported(bioStatus.isAvailable && bioStatus.hasEnrolled);
        setBiometricType(bioStatus.biometryType);

        const bioActive = await checkStorageBiometrics();
        setIsBiometricActive(bioActive);

        const savedToken = await getAuthToken();
        if (savedToken) {
          setToken(savedToken);
          // Verify session with backend
          try {
            const res = await api.getMe();
            if (res && res.user) {
              setUser({
                id: res.user.id,
                name: res.user.name,
                email: res.user.email,
                phone: res.user.phone,
                emailVerified: Boolean(res.user.email_verified),
                phoneVerified: Boolean(res.user.phone_verified),
                theme: res.settings?.theme,
                currency: res.settings?.currency || '₹',
                notifications: Boolean(res.settings?.notifications),
                reduceMotion: Boolean(res.settings?.reduce_motion)
              });
              // Register push token
              registerForPushNotifications().catch(() => {});
            }
          } catch (fetchErr) {
            console.warn('[Auth] Session restore failed, token invalid:', fetchErr);
            await removeAuthToken();
            setToken(null);
            setUser(null);
          }
        }
      } catch (err) {
        console.warn('[Auth] Init error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (identifier: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login({ identifier, password });
      await saveAuthToken(res.token);
      setToken(res.token);
      setUser({
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        phone: res.user.phone,
        emailVerified: Boolean(res.user.email_verified),
        phoneVerified: Boolean(res.user.phone_verified)
      });
      registerForPushNotifications().catch(() => {});
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, phone: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.register({ name, email, phone, password });
      await saveAuthToken(res.token);
      setToken(res.token);
      setUser({
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        phone: res.user.phone,
        emailVerified: Boolean(res.user.email_verified),
        phoneVerified: Boolean(res.user.phone_verified)
      });
      registerForPushNotifications().catch(() => {});
      return res.message;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.logout().catch(() => {});
    } finally {
      await removeAuthToken();
      setToken(null);
      setUser(null);
      setIsLoading(false);
    }
  };

  const refreshProfile = useCallback(async () => {
    try {
      const res = await api.getMe();
      if (res && res.user) {
        setUser(prev => ({
          ...prev,
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          phone: res.user.phone,
          emailVerified: Boolean(res.user.email_verified),
          phoneVerified: Boolean(res.user.phone_verified),
          theme: res.settings?.theme,
          currency: res.settings?.currency || '₹',
          notifications: Boolean(res.settings?.notifications),
          reduceMotion: Boolean(res.settings?.reduce_motion)
        }));
      }
    } catch (err) {
      console.warn('[Auth] Refresh profile error:', err);
    }
  }, []);

  const sendEmailVerification = async () => {
    const res = await api.sendEmailVerification();
    return res.message;
  };

  const verifyEmail = async (vToken: string) => {
    const res = await api.verifyEmail(vToken);
    if (res.verified) {
      await refreshProfile();
    }
    return res.verified;
  };

  const sendPhoneOtp = async () => {
    const res = await api.sendPhoneOtp();
    return res.cooldown || 60;
  };

  const verifyPhoneOtp = async (otp: string) => {
    const res = await api.verifyPhoneOtp(otp);
    if (res.verified) {
      await refreshProfile();
    }
    return res.verified;
  };

  const forgotPassword = async (identifier: string) => {
    const res = await api.forgotPassword(identifier);
    return res.message;
  };

  const resetPassword = async (identifier: string, otp: string, newPass: string) => {
    const res = await api.resetPassword({ identifier, otp, newPassword: newPass });
    return res.success;
  };

  const toggleBiometrics = async (enable: boolean) => {
    if (enable) {
      const success = await authenticateWithBiometrics('Confirm your biometric identity to enable biometric sign-in');
      if (success) {
        await saveStorageBiometrics(true);
        setIsBiometricActive(true);
        return true;
      }
      return false;
    } else {
      await saveStorageBiometrics(false);
      setIsBiometricActive(false);
      return true;
    }
  };

  const unlockWithBiometrics = async () => {
    if (!isBiometricActive) return false;
    return await authenticateWithBiometrics('Unlock Galaxy Finance Command Center');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isBiometricSupported,
        biometricType,
        isBiometricActive,
        login,
        register,
        logout,
        sendEmailVerification,
        verifyEmail,
        sendPhoneOtp,
        verifyPhoneOtp,
        forgotPassword,
        resetPassword,
        toggleBiometrics,
        unlockWithBiometrics,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
