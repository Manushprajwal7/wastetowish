"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Leaf } from "lucide-react";
import { useAuth } from "@/components/auth-context";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      router.push("/marketplace");
    }
  }, [user, loading, router]);

  const validateForm = () => {
    if (!name.trim()) {
      setError("Please enter your name");
      return false;
    }

    if (!email.trim()) {
      setError("Please enter your email");
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (!password) {
      setError("Please enter a password");
      return false;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    return true;
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset error state
    setError("");

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      console.log("Attempting to create user with email:", email);

      // Check if Firebase auth is properly initialized
      if (!auth) {
        throw new Error("Firebase Auth is not initialized properly");
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      console.log("User created successfully:", userCredential.user);

      // Update user profile with display name
      await updateProfile(userCredential.user, {
        displayName: name,
      });

      console.log("User profile updated with name:", name);

      // Create user document in Firestore with complete user data
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name,
        email,
        ecoPoints: 0,
        createdAt: Date.now(),
        emailVerified: userCredential.user.emailVerified,
        rating: 0,
        reviewCount: 0,
        totalDonations: 0,
        totalRequests: 0,
        blockedUsers: [],
      });

      console.log("User document created in Firestore");

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Signup error:", err);
      console.error("Error code:", err.code);
      console.error("Error message:", err.message);

      // Handle specific Firebase errors
      if (err.code === "auth/email-already-in-use") {
        setError(
          "An account with this email already exists. Please try logging in instead."
        );
      } else if (err.code === "auth/invalid-email") {
        setError(
          "Invalid email address. Please check your email and try again."
        );
      } else if (err.code === "auth/operation-not-allowed") {
        setError(
          "Email/password authentication is not enabled. Please contact support or check Firebase console."
        );
      } else if (err.code === "auth/weak-password") {
        setError(
          "Password is too weak. Please use a stronger password (at least 6 characters)."
        );
      } else if (err.code === "auth/configuration-not-found") {
        setError(
          "Authentication service is not properly configured. Please ensure Firebase Authentication is enabled in the Firebase Console."
        );
      } else if (err.code === "auth/network-request-failed") {
        setError(
          "Network error. Please check your internet connection and try again."
        );
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many signup attempts. Please try again later.");
      } else {
        setError(
          `Signup failed: ${
            err.message || "Unknown error occurred. Please try again."
          }`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Don't render the signup form if user is already logged in
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>You are already logged in. Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/10 px-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-lg p-8">
          <div className="flex justify-center mb-6">
            <Leaf className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-2">
            Join Waste to Wish
          </h1>
          <p className="text-center text-muted-foreground mb-6">
            Start sharing and making a difference
          </p>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-6 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailSignup} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Full Name
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=""
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
