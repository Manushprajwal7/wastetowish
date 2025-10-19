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
  const [initialLoad, setInitialLoad] = useState(true);

  const fetchUserData = useCallback(
    async (fbUser: FirebaseUser) => {
      try {
        // Fetch user data from Firestore only if not already loaded
        if (initialLoad) {
          console.log("Fetching user data for:", fbUser.uid);

          // Increase timeout to 10 seconds to accommodate slower network conditions
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("User data fetch timeout")),
              10000
            )
          );

          const userDocPromise = getDoc(doc(db, "users", fbUser.uid));

          // Use Promise.race with better error handling
          const userDoc = (await Promise.race([
            userDocPromise,
            timeoutPromise,
          ])) as any;

          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("User data fetched successfully:", userData);

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
            console.log("User document not found, using fallback data");
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
          setInitialLoad(false);
        }
      } catch (error: any) {
        console.error("Error fetching user data:", error);

        // Handle timeout specifically
        if (error.message === "User data fetch timeout") {
          console.warn("User data fetch timed out, using minimal user data");
        }

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
        setInitialLoad(false);
      }
    },
    [initialLoad]
  );

  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setFirebaseUser(null);
      setInitialLoad(true);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        // Defer user data fetching to improve initial load time
        // Use requestIdleCallback if available for better performance
        if (window.requestIdleCallback) {
          window.requestIdleCallback(
            () => {
              fetchUserData(fbUser);
            },
            { timeout: 2000 }
          );
        } else {
          // Fallback for browsers that don't support requestIdleCallback
          setTimeout(() => {
            fetchUserData(fbUser);
          }, 100);
        }
      } else {
        setUser(null);
        setInitialLoad(true);
      }
      // Only set loading to false after initial auth state is determined
      if (loading) {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [fetchUserData, loading]);

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
