"use client";

import { useEffect } from "react";
import { auth } from "@/lib/firebase";

export function FirebaseDebug() {
  useEffect(() => {
    console.log("Firebase Debug: Checking auth state");
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log("Firebase Debug: Auth state changed", user);
      if (user) {
        console.log("Firebase Debug: User is signed in", {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        });
      } else {
        console.log("Firebase Debug: No user is signed in");
      }
    });

    return () => unsubscribe();
  }, []);

  return null;
}
