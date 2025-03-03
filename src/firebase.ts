import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Dodajemy zakresy wymagane dla Google Fit
googleProvider.addScope("https://www.googleapis.com/auth/fitness.activity.read");

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // Zapisujemy token dostępu do późniejszego użycia przy zapytaniach do Google Fit API
    const credential = GoogleAuthProvider.credentialFromResult(result);

    if (credential) {
      // Zapisujemy token w localStorage aby mieć do niego dostęp później
      localStorage.setItem("googleFitToken", credential.accessToken || "");
    }

    return result.user;
  } catch (error) {
    console.error("Błąd podczas logowania:", error);
    throw error;
  }
};

export const logoutUser = () => {
  localStorage.removeItem("googleFitToken");
  return signOut(auth);
};

export { auth };
