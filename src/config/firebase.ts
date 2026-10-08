import { initializeApp, getApps, getApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import type { Auth, User as FirebaseUser } from 'firebase/auth';

/**
 * Clean and normalize environment variables (strips accidental surrounding quotes and whitespace).
 */
function cleanEnv(value: string | undefined, fallback: string = ''): string {
  if (!value) return fallback;
  return String(value).trim().replace(/^["']|["']$/g, '');
}

/**
 * GALAXY FINANCE — FIREBASE AUTHENTICATION CONFIGURATION
 * Reads client credentials securely from Vite environment variables.
 * All variables MUST use the VITE_ prefix to be exposed to the browser bundle.
 */
export const firebaseConfig = {
  apiKey: cleanEnv(import.meta.env.VITE_FIREBASE_API_KEY, 'AIzaSyBgS7gFWD-8q71EwTbVN_aJa9CCWAgxzE8'),
  authDomain: cleanEnv(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, 'galaxy-finance-9b3bb.firebaseapp.com'),
  projectId: cleanEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID, 'galaxy-finance-9b3bb'),
  storageBucket: cleanEnv(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, 'galaxy-finance-9b3bb.firebasestorage.app'),
  messagingSenderId: cleanEnv(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID, '107121185906'),
  appId: cleanEnv(import.meta.env.VITE_FIREBASE_APP_ID, '1:107121185906:web:c8c8772458d0c2c4ca5eeb'),
  measurementId: cleanEnv(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID, 'G-QEGHR9PPQP')
};

/**
 * Helper to check whether Firebase is configured with a real, active Web API Key.
 * A genuine Google/Firebase Web API key starts with 'AIza' and does not contain placeholder tokens.
 */
export function isFirebaseConfigured(): boolean {
  const key = firebaseConfig.apiKey;
  if (!key) return false;
  if (!key.startsWith('AIza')) return false;
  const isPlaceholder = 
    key.includes('Demo') || 
    key.includes('YourFirebase') || 
    key.includes('placeholder') || 
    key.includes('TODO');
  return !isPlaceholder;
}

// Pre-initialization safety check and diagnostic logging
if (!firebaseConfig.apiKey) {
  console.warn(
    '[Galaxy Finance Firebase Auth] Warning: VITE_FIREBASE_API_KEY is undefined or empty. ' +
    'Please configure your Firebase credentials in .env.'
  );
}

// Development Diagnostic Logger
if (import.meta.env.DEV) {
  if (!isFirebaseConfigured()) {
    console.warn(
      '%c🔒 [Galaxy Finance Firebase Auth]%c Running in unconfigured/placeholder mode.\n' +
      'To enable live Google Sign-In and cloud auth:\n' +
      '1. Open Firebase Console (https://console.firebase.google.com/) > Project Settings > General > Your Apps > Web App.\n' +
      '2. Copy your Web API Key and paste into .env: VITE_FIREBASE_API_KEY=AIzaSy...\n' +
      '3. Restart the Vite dev server (npm run dev).',
      'background: #4A121A; color: #FBFBFB; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
      'color: #8E929D;'
    );
  } else {
    console.info(
      '%c⚡ [Galaxy Finance Firebase Auth]%c Live configuration active (Project: ' + firebaseConfig.projectId + ')',
      'background: #10B981; color: #0D0D11; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
      'color: #FBFBFB;'
    );
  }
}

// Initialize or reuse singleton Firebase App instance
export const app: FirebaseApp = getApps().length === 0 
  ? initializeApp(firebaseConfig) 
  : getApp();

// Initialize Firebase Authentication service
export const auth: Auth = getAuth(app);

// Configure Google OAuth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

/**
 * Formats raw Firebase error codes into human-readable, actionable messages.
 */
export function formatFirebaseAuthError(err: any): Error {
  const code = err?.code || '';
  const message = err?.message || '';

  if (code === 'auth/configuration-not-found' || message.includes('configuration-not-found')) {
    return new Error(
      'Google Sign-In is not enabled yet in your Firebase project (auth/configuration-not-found). In the Firebase Console, go to Build > Authentication > Sign-in method, locate "Google", toggle "Enable" to ON, select your Project support email, and click Save.'
    );
  }
  if (code === 'auth/operation-not-allowed' || message.includes('operation-not-allowed')) {
    return new Error(
      'Sign-in provider is disabled in Firebase Console. Please enable Email/Password or Google under Authentication > Sign-in method.'
    );
  }
  if (code === 'auth/popup-closed-by-user' || message.includes('popup-closed-by-user')) {
    return new Error('Google Sign-In popup was closed before authentication completed.');
  }
  if (code === 'auth/popup-blocked' || message.includes('popup-blocked')) {
    return new Error(
      'Sign-in popup was blocked by your browser. Please allow popups for localhost / this site and try again.'
    );
  }
  if (code === 'auth/cancelled-popup-request' || message.includes('cancelled-popup-request')) {
    return new Error('Authentication request was superseded by another action. Please try again.');
  }
  if (code === 'auth/unauthorized-domain' || message.includes('unauthorized-domain')) {
    return new Error(
      'Domain unauthorized (auth/unauthorized-domain). Ensure "localhost" and "127.0.0.1" are added to Authorized Domains in Firebase Console > Authentication > Settings > Authorized domains.'
    );
  }
  if (code === 'auth/api-key-not-valid' || message.includes('api-key-not-valid')) {
    return new Error(
      'Invalid Firebase API Key (auth/api-key-not-valid). Please update VITE_FIREBASE_API_KEY in your .env file with your valid Web API Key from the Firebase Console (Project Settings > General > Web App), then restart the dev server.'
    );
  }
  if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
    return new Error('Invalid email or password. Please check your credentials.');
  }
  if (code === 'auth/email-already-in-use') {
    return new Error('An account with this email already exists.');
  }
  if (code === 'auth/network-request-failed' || message.includes('network-request-failed')) {
    return new Error('Network error connecting to Firebase. Please check your internet connection.');
  }
  return new Error(err.message || 'Firebase authentication failed.');
}

/**
 * Sign in using Google OAuth Popup
 */
export async function signInWithGoogle(): Promise<{ user: FirebaseUser; token: string }> {
  if (!isFirebaseConfigured()) {
    throw new Error(
      'Firebase Authentication is not configured with a valid Web API key. Please add your VITE_FIREBASE_API_KEY in .env, or use the demo login credentials below.'
    );
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const token = await result.user.getIdToken();
    return { user: result.user, token };
  } catch (err: any) {
    // Defensively handle popup inspection and COOP issues:
    // If auth state succeeded or currentUser is populated despite window.closed / COOP lifecycle exception
    if (auth.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken();
        return { user: auth.currentUser, token };
      } catch {
        // Fall back to standard error formatting
      }
    }

    const errMessage = String(err?.message || '');
    if (
      errMessage.includes('Cross-Origin-Opener-Policy') ||
      errMessage.includes('window.closed')
    ) {
      if (auth.currentUser) {
        try {
          const token = await auth.currentUser.getIdToken();
          return { user: auth.currentUser, token };
        } catch {
          // Fall back to standard error formatting
        }
      }
    }
    throw formatFirebaseAuthError(err);
  }
}

/**
 * Sign in using Email and Password via Firebase
 */
export async function signInWithFirebaseEmail(email: string, pass: string): Promise<{ user: FirebaseUser; token: string }> {
  if (!isFirebaseConfigured()) {
    throw new Error(
      'Firebase Authentication is not configured with a valid Web API key. Please add your VITE_FIREBASE_API_KEY in .env, or use the demo login credentials below.'
    );
  }
  try {
    const credential = await signInWithEmailAndPassword(auth, email.trim(), pass);
    const token = await credential.user.getIdToken();
    return { user: credential.user, token };
  } catch (err: any) {
    throw formatFirebaseAuthError(err);
  }
}

/**
 * Register / Create new user with Email and Password via Firebase
 */
export async function signUpWithFirebaseEmail(
  email: string, 
  pass: string, 
  displayName?: string
): Promise<{ user: FirebaseUser; token: string }> {
  if (!isFirebaseConfigured()) {
    throw new Error(
      'Firebase Authentication is not configured with a valid Web API key. Please add your VITE_FIREBASE_API_KEY in .env, or use the demo login credentials below.'
    );
  }
  try {
    const credential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (displayName && credential.user) {
      try {
        await updateProfile(credential.user, { displayName: displayName.trim() });
      } catch {
        // Non-fatal if display name update is deferred
      }
    }
    const token = await credential.user.getIdToken();
    return { user: credential.user, token };
  } catch (err: any) {
    throw formatFirebaseAuthError(err);
  }
}

/**
 * Sign out from Firebase
 */
export async function logOutFromFirebase(): Promise<void> {
  try {
    await signOut(auth);
  } catch {
    // Non-fatal if session already invalidated
  }
}

/**
 * Listen to Firebase Auth state changes
 */
export function onFirebaseAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}
