"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@/lib/types";
import { ArrowLeft, Award, Leaf, Heart, Star } from "lucide-react";
import { ProtectedRoute } from "@/components/protected-route";

export default function ProfilePage() {
  const { user, firebaseUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [profileData, setProfileData] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    location: "",
  });

  useEffect(() => {
    if (!firebaseUser) return;

    const fetchProfile = async () => {
      try {
        const docRef = doc(db, "users", firebaseUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as User;
          setProfileData(data);
          setFormData({
            name: data.name,
            email: data.email,
            bio: data.bio || "",
            location: data.location || "",
          });
        }
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [firebaseUser]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;

    setSaving(true);
    setError("");

    try {
      await updateDoc(doc(db, "users", firebaseUser.uid), {
        name: formData.name,
        email: formData.email,
        bio: formData.bio,
        location: formData.location,
      });

      setProfileData({
        ...profileData!,
        name: formData.name,
        email: formData.email,
        bio: formData.bio,
        location: formData.location,
      });
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : !user ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-lg mb-4">Please sign in to view your profile</p>
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-background">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-primary hover:underline mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="bg-card border border-border rounded-lg p-8">
              <h1 className="text-3xl font-bold mb-8">My Profile</h1>

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6 text-destructive">
                  {error}
                </div>
              )}

              <div className="mb-8 p-6 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="w-6 h-6 text-primary" />
                  <h3 className="font-semibold">Eco Points</h3>
                </div>
                <p className="text-3xl font-bold text-primary">
                  {profileData?.ecoPoints || 0}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Earned from donations and successful requests
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Your name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    placeholder="Tell others about yourself..."
                    className="w-full px-3 py-2 border border-border rounded-md bg-background min-h-24"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Location
                  </label>
                  <Input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="City, State"
                  />
                </div>

                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Member since:</span>{" "}
                    {profileData?.createdAt
                      ? new Date(profileData.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={saving} className="flex-1">
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </div>
              </form>

              <div className="mt-8 pt-8 border-t border-border">
                <h3 className="font-semibold mb-4">Quick Links</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Link href="/my-items">
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2 bg-transparent"
                    >
                      <Leaf className="w-4 h-4" />
                      My Items
                    </Button>
                  </Link>
                  <Link href="/requests">
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2 bg-transparent"
                    >
                      <Leaf className="w-4 h-4" />
                      My Requests
                    </Button>
                  </Link>
                  <Link href="/ratings">
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2 bg-transparent"
                    >
                      <Star className="w-4 h-4" />
                      My Ratings
                    </Button>
                  </Link>
                  <Link href="/wishlist">
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2 bg-transparent"
                    >
                      <Heart className="w-4 h-4" />
                      Wishlist
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
