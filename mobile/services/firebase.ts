import { initializeApp, getApps, getApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import type { Auth, User as FirebaseUser } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Clean environment variables and fallback gracefully
 */
function cleanEnv(value: string | undefined, fallback: string = ''): string {
  if (!value) return fallback;
  return String(value).trim().replace(/^["']|["']$/g, '');
}

/**
 * GALAXY FINANCE — FIREBASE MOBILE AUTHENTICATION CONFIGURATION
 * Reads client credentials from Expo environment variables with EXPO_PUBLIC_ prefix
 */
export const firebaseConfig = {
  apiKey: cleanEnv(process.env.EXPO_PUBLIC_FIREBASE_API_KEY, 'AIzaSyBgS7gFWD-8q71EwTbVN_aJa9CCWAgxzE8'),
  authDomain: cleanEnv(process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN, 'galaxy-finance-9b3bb.firebaseapp.com'),
  projectId: cleanEnv(process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID, 'galaxy-finance-9b3bb'),
  storageBucket: cleanEnv(process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET, 'galaxy-finance-9b3bb.firebasestorage.app'),
  messagingSenderId: cleanEnv(process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, '107121185906'),
  appId: cleanEnv(process.env.EXPO_PUBLIC_FIREBASE_APP_ID, '1:107121185906:android:b20dfa166185d26aca5eeb'),
  measurementId: cleanEnv(process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID, 'G-QEGHR9PPQP'),
};

/**
 * Initialize or retrieve the singleton Firebase App instance
 */
export const app: FirebaseApp = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

/**
 * Initialize Firebase Auth with React Native persistence
 */
let authInstance: Auth;
try {
  // In React Native environment, initializeAuth with AsyncStorage persistence
  // @ts-ignore - getReactNativePersistence is available in firebase/auth/react-native or fallback to standard getAuth
  const { getReactNativePersistence } = require('firebase/auth');
  authInstance = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  // Fallback to getAuth if already initialized or in web mode
  authInstance = getAuth(app);
}

export const auth: Auth = authInstance;

/**
 * Formats raw Firebase error codes into clear, human-readable mobile messages
 */
export function formatFirebaseAuthError(err: any): Error {
  const code = err?.code || '';
  const message = err?.message || '';

  if (code === 'auth/configuration-not-found' || message.includes('configuration-not-found')) {
    return new Error('Google Sign-In or Auth configuration is not yet enabled in your Firebase console. Please enable it under Authentication > Sign-in method.');
  }
  if (code === 'auth/unauthorized-domain' || message.includes('unauthorized-domain')) {
    return new Error('This domain or origin is unauthorized. Please add it to Authorized Domains in Firebase Console > Authentication > Settings.');
  }
  if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
    return new Error('Invalid email or password. Please verify your credentials.');
  }
  if (code === 'auth/email-already-in-use') {
    return new Error('An account with this email address already exists.');
  }
  if (code === 'auth/invalid-email') {
    return new Error('Please enter a valid email address.');
  }
  if (code === 'auth/weak-password') {
    return new Error('Password must be at least 6 characters long.');
  }
  if (code === 'auth/network-request-failed' || message.includes('network')) {
    return new Error('Network error. Please check your mobile data or Wi-Fi connection.');
  }
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled') {
    return new Error('Sign-in was cancelled.');
  }
  return new Error(err.message || 'Authentication failed. Please try again.');
}

/**
 * Email & Password Sign In
 */
export async function signInWithEmail(
  email: string,
  pass: string
): Promise<{ user: FirebaseUser; token: string }> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    const token = await cred.user.getIdToken();
    return { user: cred.user, token };
  } catch (err: any) {
    throw formatFirebaseAuthError(err);
  }
}

/**
 * Email & Password Sign Up / Registration
 */
export async function signUpWithEmail(
  email: string,
  pass: string,
  displayName?: string
): Promise<{ user: FirebaseUser; token: string }> {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (displayName && cred.user) {
      try {
        await updateProfile(cred.user, { displayName: displayName.trim() });
      } catch {}
    }
    const token = await cred.user.getIdToken();
    return { user: cred.user, token };
  } catch (err: any) {
    throw formatFirebaseAuthError(err);
  }
}

/**
 * Native Google Sign-In with Google Auth Credential Passing
 * Accepts ID token (and optional access token) from @react-native-google-signin/google-signin
 * or expo-auth-session, and cleanly establishes the Firebase session via signInWithCredential.
 */
export async function signInWithGoogleNativeCredential(
  idToken: string,
  accessToken?: string
): Promise<{ user: FirebaseUser; token: string }> {
  try {
    const credential = GoogleAuthProvider.credential(idToken, accessToken);
    const result = await signInWithCredential(auth, credential);
    const token = await result.user.getIdToken();
    return { user: result.user, token };
  } catch (err: any) {
    throw formatFirebaseAuthError(err);
  }
}

/**
 * Sign Out from Firebase Mobile
 */
export async function logOutFromFirebase(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.warn('[Firebase Auth] Sign out notice:', err);
  }
}

/**
 * Native Auth State Listener
 */
export function onAuthStateChangedListener(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}
