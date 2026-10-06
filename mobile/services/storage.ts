import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const AUTH_TOKEN_KEY = 'galaxy_auth_token';
const USER_DATA_KEY = 'galaxy_user_profile';
const THEME_KEY = 'galaxy_theme_mode';
const PENDING_TX_KEY = 'galaxy_offline_transactions';
const BIOMETRIC_ENABLED_KEY = 'galaxy_biometric_enabled';
const API_URL_KEY = 'galaxy_custom_api_url';

// Secure Token Operations (Uses iOS Keychain / Android Keystore)
export async function saveAuthToken(token: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token, {
        keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK
      });
    }
  } catch (err) {
    console.warn('[SecureStore] Fallback to AsyncStorage for token:', err);
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  }
}

export async function getAuthToken(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    }
    return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  } catch (err) {
    console.warn('[SecureStore] Fallback to AsyncStorage for get:', err);
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  }
}

export async function removeAuthToken(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    } else {
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    }
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (err) {
    console.warn('[SecureStore] Error removing token:', err);
  }
}

// Biometric setting
export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, JSON.stringify(enabled));
}

export async function isBiometricEnabled(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
    return val ? JSON.parse(val) : false;
  } catch {
    return false;
  }
}

// Offline Pending Queue Storage
export async function getOfflineQueue(): Promise<any[]> {
  try {
    const raw = await AsyncStorage.getItem(PENDING_TX_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveOfflineQueue(queue: any[]): Promise<void> {
  await AsyncStorage.setItem(PENDING_TX_KEY, JSON.stringify(queue));
}

export async function clearOfflineQueue(): Promise<void> {
  await AsyncStorage.removeItem(PENDING_TX_KEY);
}

// Theme storage
export async function getStoredTheme(): Promise<string | null> {
  return await AsyncStorage.getItem(THEME_KEY);
}

export async function saveStoredTheme(theme: string): Promise<void> {
  await AsyncStorage.setItem(THEME_KEY, theme);
}

// Custom API Host (for testing on real phone on LAN)
export async function getCustomApiUrl(): Promise<string | null> {
  return await AsyncStorage.getItem(API_URL_KEY);
}

export async function setCustomApiUrl(url: string): Promise<void> {
  if (!url) {
    await AsyncStorage.removeItem(API_URL_KEY);
  } else {
    await AsyncStorage.setItem(API_URL_KEY, url);
  }
}
