import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// 🔥 Firebase Config Debug - Let Firebase handle client ID automatically
console.group("🔥 Firebase Config Debug");
console.log("🌐 Current domain:", window.location.hostname);
console.log("🌐 Current origin:", window.location.origin);
console.log("🔐 Auth Domain:", firebaseConfig.authDomain);
console.log("🔑 Client ID will be derived from appId:", firebaseConfig.appId);
console.log("📋 Full Firebase config:", {
  apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : 'missing',
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId ? `${firebaseConfig.appId.substring(0, 20)}...` : 'missing'
});
console.log("🔧 Environment variables:", {
  VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  NODE_ENV: import.meta.env.NODE_ENV,
  MODE: import.meta.env.MODE
});
console.groupEnd();

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

// Initialize Firebase services with error handling
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

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

// Configure Google Auth Provider - Let Firebase handle redirect URI automatically
export const googleProvider = new GoogleAuthProvider();
// Remove custom redirect_uri - Firebase handles this based on authDomain

// Create a separate provider for YouTube scopes
export const googleProviderWithYouTube = new GoogleAuthProvider();
googleProviderWithYouTube.addScope('https://www.googleapis.com/auth/youtube.readonly');
// Remove custom redirect_uri - Firebase handles this based on authDomain

// 🔍 Debug Google Auth Provider Configuration
console.group("🔍 Google Auth Provider Debug");
console.log("🔑 Firebase will derive client ID from appId:", firebaseConfig.appId);
console.log("🔄 Firebase will auto-construct redirect URI from authDomain:", firebaseConfig.authDomain);
console.log("🎯 Expected redirect URI:", `https://${firebaseConfig.authDomain}/__/auth/handler`);
console.log("📋 Basic Provider Custom Params:", googleProvider.customParameters || 'none');
console.log("📋 YouTube Provider Custom Params:", googleProviderWithYouTube.customParameters || 'none');
console.log("🚨 CRITICAL: If auth still fails with old client ID:");
console.log("   - Clear browser cache completely (Ctrl+Shift+Delete)");
console.log("   - Try incognito/private mode");
console.log("   - Check for other Google Cloud projects");
console.log("   - Old client ID might be in different project:");
console.log("     485151111726-56bglso73que2ilprb8mvqm3iioq3k9m.apps.googleusercontent.com");

// Clear any potential service worker cache
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => {
      console.log('🧹 Clearing service worker registration');
      registration.unregister();
    });
  });
}
console.groupEnd();

export default app;
