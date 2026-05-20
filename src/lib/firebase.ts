import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import fallbackConfig from '../../firebase-applet-config.json';

// Support Vite environment variables for safe production deployments (e.g. Vercel) without committing secrets to Git
const metaEnv = (import.meta as any).env || {};
const isCustomProject = !!metaEnv.VITE_FIREBASE_PROJECT_ID;

const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || fallbackConfig.apiKey,
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || fallbackConfig.authDomain,
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || fallbackConfig.projectId,
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || fallbackConfig.storageBucket,
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || fallbackConfig.messagingSenderId,
  appId: metaEnv.VITE_FIREBASE_APP_ID || fallbackConfig.appId,
  measurementId: metaEnv.VITE_FIREBASE_MEASUREMENT_ID || fallbackConfig.measurementId,
  // If they configured a custom project ID, do NOT fall back to the sandbox database ID unless explicitly requested
  firestoreDatabaseId: isCustomProject 
    ? (metaEnv.VITE_FIREBASE_DATABASE_ID || '')
    : (metaEnv.VITE_FIREBASE_DATABASE_ID || fallbackConfig.firestoreDatabaseId),
};

const app = initializeApp(firebaseConfig);

// If the databaseId is default, pass nothing so the client SDK uses default behaviour.
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);


