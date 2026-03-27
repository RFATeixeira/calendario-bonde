import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyDSXEKs7MK1Z-D6tOrprAir5aobLjQhDeo',
  authDomain: 'calendario-bonde.firebaseapp.com',
  projectId: 'calendario-bonde',
  storageBucket: 'calendario-bonde.firebasestorage.app',
  messagingSenderId: '977956632595',
  appId: '1:977956632595:web:339dfe89c95f1b6e40e7e6',
  measurementId: 'G-6BW2VR3PD0'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Analytics only works in browser environments.
export let analytics: Analytics | null = null;

if (typeof window !== 'undefined') {
  void isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export default app;