"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  type User as FirebaseUser,
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { User } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async (fbUser: FirebaseUser) => {
    try {
      // Fetch user data from Firestore
      const userDoc = await getDoc(doc(db, "users", fbUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUser({
          id: fbUser.uid,
          name: userData.name || fbUser.displayName || "User",
          email: userData.email || fbUser.email || "",
          photoURL: userData.photoURL || fbUser.photoURL || undefined,
          ecoPoints: userData.ecoPoints || 0,
          createdAt: userData.createdAt || Date.now(),
          emailVerified: fbUser.emailVerified,
          rating: userData.rating,
          reviewCount: userData.reviewCount,
          bio: userData.bio,
          location: userData.location,
          joinedDate: userData.joinedDate,
          totalDonations: userData.totalDonations,
          totalRequests: userData.totalRequests,
          blockedUsers: userData.blockedUsers || [],
        });
      } else {
        // Fallback if user document doesn't exist
        setUser({
          id: fbUser.uid,
          name: fbUser.displayName || "User",
          email: fbUser.email || "",
          photoURL: fbUser.photoURL || undefined,
          ecoPoints: 0,
          createdAt: Date.now(),
          emailVerified: fbUser.emailVerified,
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      // Fallback user data
      setUser({
        id: fbUser.uid,
        name: fbUser.displayName || "User",
        email: fbUser.email || "",
        photoURL: fbUser.photoURL || undefined,
        ecoPoints: 0,
        createdAt: Date.now(),
        emailVerified: fbUser.emailVerified,
      });
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        await fetchUserData(fbUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [fetchUserData]);

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
