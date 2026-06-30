// ============================================================
// GramSahay — Firebase Configuration
// ALL secrets come from environment variables ONLY.
// No hardcoded keys here.
// ============================================================

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Validate all required env vars are present
const required = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
];
for (const key of required) {
  if (!import.meta.env[key]) {
    console.error(`❌ Missing environment variable: ${key}`);
  }
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Services
export const auth             = getAuth(app);
export const db               = initializeFirestore(app, { experimentalForceLongPolling: true }, "gramsahay");
export const googleProvider   = new GoogleAuthProvider();

// Configure Google provider
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Analytics (only in browser, only if supported)
isSupported().then(yes => {
  if (yes) getAnalytics(app);
}).catch(() => {});

export default app;
