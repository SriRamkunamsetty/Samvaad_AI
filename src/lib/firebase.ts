import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBKL4VnytBKSieQwT8_P8yFGNiKIx9ehXc",
  authDomain: "samvaad-ai-fe236.firebaseapp.com",
  projectId: "samvaad-ai-fe236",
  storageBucket: "samvaad-ai-fe236.firebasestorage.app",
  messagingSenderId: "802316223393",
  appId: "1:802316223393:web:72dcdc0b295e2e593fc1e0",
  measurementId: "G-JPQ0C6B0S4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export const initAnalytics = async () => {
  if (await isSupported()) {
    return getAnalytics(app);
  }
  return null;
};
