import { initializeApp } from "firebase/app";
import {
  getAuth,
  browserLocalPersistence,
  setPersistence,
} from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  enableNetwork,
  disableNetwork,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Validate Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  // Note: Do not include databaseURL for Firestore - only needed for Realtime Database
};

// Check for missing configuration
const missingConfig = Object.entries(firebaseConfig).filter(
  ([key, value]) => !value
);
if (missingConfig.length > 0) {
  console.warn(
    "Missing Firebase configuration:",
    missingConfig.map(([key]) => key)
  );
}

const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication with persistence
export const auth = getAuth(app);
// Set persistence to LOCAL (survives browser restarts)
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Error setting auth persistence:", error);
});

// Initialize Firestore with offline persistence
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

// Enable network connectivity
enableNetwork(db).catch((error) => {
  console.warn("Failed to enable Firestore network:", error);
});

// Connect to Firestore emulator in development if needed
if (
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST
) {
  const [host, port] =
    process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST.split(":");
  connectFirestoreEmulator(db, host, parseInt(port));
  console.log("Firestore Emulator connected");
}

export const storage = getStorage(app);

// Check if auth is properly initialized
auth.onAuthStateChanged(
  (user) => {
    if (user) {
      console.log("Firebase Auth initialized with user:", user.email);
    } else {
      console.log("Firebase Auth initialized, no user signed in");
    }
  },
  (error) => {
    console.error("Firebase Auth initialization error:", error);
  }
);

// Enable authentication emulator in development if needed
if (
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST
) {
  // In a real implementation, you would connect to the emulator here
  console.log("Firebase Auth Emulator enabled");
}
