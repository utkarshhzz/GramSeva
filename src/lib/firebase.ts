// ============================================================
// GramSahay — Firebase Configuration
// ============================================================

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || 'AIzaSyA2A0P1lv5EucAuceAPF1ds0lFT0LfyQXo',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || 'gramsahay-76b24.firebaseapp.com',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || 'gramsahay-76b24',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || 'gramsahay-76b24.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '333819068949',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || '1:333819068949:web:f293ab341fe13c5c4d841c',
  measurementId:     'G-JJ3Y44Y46T',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Services
export const auth = getAuth(app);
export const db   = getFirestore(app);

// Analytics (only in browser)
let analytics: ReturnType<typeof getAnalytics> | null = null;
try {
  analytics = getAnalytics(app);
} catch (e) {
  // Analytics may fail in SSR or test environments
}
export { analytics };

export default app;
