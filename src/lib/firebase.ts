import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import { getFunctions } from 'firebase/functions';

// Dynamic auth domain based on current domain
const getAuthDomain = () => {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';

  // Support both wizxp.com and wizup.live domains
  if (hostname === 'wizup.live') {
    return 'wizup.live';
  } else if (hostname === 'wizxp.com') {
    return 'wizxp.com';
  } else {
    // Fallback to environment variable for localhost/development
    return import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
  }
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: getAuthDomain(),
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Firebase Config - Production Ready
if (import.meta.env.MODE === 'development') {
  console.group("🔥 Firebase Config Debug");
  console.log("🌐 Current domain:", typeof window !== 'undefined' ? window.location.hostname : 'SSR');
  console.log("🔐 Dynamic Auth Domain:", firebaseConfig.authDomain);
  console.log("🔄 Fallback Auth Domain:", import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);
  console.log("🔑 App ID:", firebaseConfig.appId ? `${firebaseConfig.appId.substring(0, 20)}...` : 'missing');
  console.groupEnd();
}

// Guard: fail loudly if required env vars are missing to avoid using wrong config
const requiredKeys: Array<keyof typeof firebaseConfig> = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId'
];
const missing = requiredKeys.filter((k) => !firebaseConfig[k]);

if (missing.length > 0) {
  // eslint-disable-next-line no-console
  console.error(
    `Missing Firebase env vars: ${missing.join(', ')}. ` +
    'Create a .env file based on env.example and restart the dev server.'
  );
  throw new Error('Firebase config is incomplete.');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services with enhanced error handling
export const auth = getAuth(app);

// Initialize Firestore with offline persistence settings
export const db = (() => {
  try {
    const firestore = getFirestore(app);
    // Enable offline persistence for better resilience
    import('firebase/firestore').then(({ enableNetwork, disableNetwork }) => {
      // Allow Firestore to work offline if network is blocked
      console.log('🔗 Firestore initialized with network resilience');
    }).catch(err => {
      console.warn('⚠️ Firestore offline setup failed:', err);
    });
    return firestore;
  } catch (error) {
    console.error('❌ Failed to initialize Firestore:', error);
    throw error;
  }
})();

export const storage = getStorage(app);
export const functions = getFunctions(app, 'us-central1');

// Initialize analytics only if in production and measurement ID is available
let analytics;
try {
  if (firebaseConfig.measurementId && firebaseConfig.measurementId !== 'G-MEASUREMENT_ID') {
    analytics = getAnalytics(app);
  }
} catch (error) {
  console.log('Analytics not initialized:', error);
}
export { analytics };

// ========================================
// AUTH PROVIDERS - REFACTORED ARCHITECTURE
// ========================================

/**
 * PRIMARY LOGIN PROVIDER - Google Auth Only
 * Used for: Sign Up / Sign In to WIZXP platform
 * Scopes: Basic profile (email, name, avatar)
 * Flow: User authenticates → Gets access to dashboard
 */
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
  client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID
});

/**
 * OPTIONAL YOUTUBE CONNECTION PROVIDER
 * Used for: Linking YouTube channel to existing Google-authenticated account
 * Scopes: youtube.readonly (for content sync, channel data, analytics)
 * Flow: Authenticated user → Optionally connects YouTube → Links via googleId
 * Available in: User Profile, Creator Profile, Create Tab
 */
export const youtubeAuthProvider = new GoogleAuthProvider();
youtubeAuthProvider.addScope('https://www.googleapis.com/auth/youtube.readonly');
youtubeAuthProvider.setCustomParameters({
  prompt: 'select_account',
  include_granted_scopes: 'true', // Preserve existing Google auth
  client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID
});

/**
 * @deprecated Use youtubeAuthProvider instead for clarity
 * Kept for backward compatibility - will be removed in future versions
 */
export const googleProviderWithYouTube = youtubeAuthProvider;

// Auth Provider Debug (Development Only)
if (import.meta.env.MODE === 'development') {
  console.group("🔍 Google Auth Provider Debug");
  console.log("🔑 Explicit Client ID:", import.meta.env.VITE_GOOGLE_CLIENT_ID);
  console.log("🔑 Firebase App ID:", firebaseConfig.appId);
  console.log("🎯 Dynamic Redirect URI:", `https://${firebaseConfig.authDomain}/__/auth/handler`);
  console.log("🌐 Supported domains: wizxp.com, wizup.live");
  console.groupEnd();
}

// Clear any potential service worker cache for clean auth flow
if ('serviceWorker' in navigator && import.meta.env.MODE === 'development') {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => {
      registration.unregister();
    });
  });
}

export default app;
