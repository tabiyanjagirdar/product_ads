// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Only initialize Firebase on the client. During SSR process.env values
// may not be available to the browser bundle and initializing on the
// server can cause runtime errors like auth/invalid-api-key.
let app;
let _auth: ReturnType<typeof getAuth> | null = null;
let _db: ReturnType<typeof getFirestore> | null = null;

if (typeof window !== 'undefined') {
  // If the public API key is missing, avoid initializing Firebase entirely.
  // Initializing with an undefined/empty apiKey will throw `auth/invalid-api-key`.
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    // eslint-disable-next-line no-console
    console.warn('Missing NEXT_PUBLIC_FIREBASE_API_KEY environment variable.\nCopy .env.example to .env.local and set your Firebase keys. Firebase will not be initialized.');
  } else {
    // Prevent multiple initializations in HMR / client runtime
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }

    _auth = getAuth(app);
    _db = getFirestore(app);
    // const analytics = getAnalytics(app);
  }
}

// Export auth and db safely. On the server these will be `null`.
export const auth = _auth;
export const db = _db;