"use client";

import { useAuth } from "@/components/auth-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@/lib/types";
import { ArrowLeft, Trash2 } from "lucide-react";

// Dynamically import Firebase only on client side
let db: any = null;
let doc: any = null;
let getDoc: any = null;
let updateDoc: any = null;
let arrayRemove: any = null;

if (typeof window !== "undefined") {
  try {
    const firebaseFirestore = require("firebase/firestore");
    const firebase = require("@/lib/firebase");

    db = firebase.db;
    doc = firebaseFirestore.doc;
    getDoc = firebaseFirestore.getDoc;
    updateDoc = firebaseFirestore.updateDoc;
    arrayRemove = firebaseFirestore.arrayRemove;
  } catch (error) {
    console.warn("Firebase not available during build time");
  }
}

export default function BlockedUsersPage() {
  const { user, firebaseUser } = useAuth();
  const router = useRouter();
  const [blockedUsers, setBlockedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Skip if Firebase is not available
    if (!db || !doc || !getDoc) {
      console.warn("Firebase not available, skipping blocked users fetch");
      setLoading(false);
      return;
    }

    if (!firebaseUser) {
      router.push("/login");
      return;
    }

    const fetchBlockedUsers = async () => {
      try {
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        const blockedUserIds = userSnap.data()?.blockedUsers || [];

        // Fetch details of blocked users
        const blockedUsersData = await Promise.all(
          blockedUserIds.map(async (userId: string) => {
            const blockedUserRef = doc(db, "users", userId);
            const blockedUserSnap = await getDoc(blockedUserRef);
            return blockedUserSnap.data() as User;
          })
        );

        setBlockedUsers(blockedUsersData.filter(Boolean));
      } catch (error) {
        console.error("Error fetching blocked users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlockedUsers();
  }, [firebaseUser, router]);

  const handleUnblock = async (blockedUserId: string) => {
    // Skip if Firebase is not available
    if (!db || !doc || !updateDoc || !arrayRemove) {
      console.warn("Firebase not available, skipping unblock");
      return;
    }

    if (!firebaseUser) return;

    try {
      const userRef = doc(db, "users", firebaseUser.uid);
      await updateDoc(userRef, {
        blockedUsers: arrayRemove(blockedUserId),
      });
      setBlockedUsers(blockedUsers.filter((u) => u.id !== blockedUserId));
    } catch (error) {
      console.error("Error unblocking user:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-primary hover:underline mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-3xl font-bold mb-8">Blocked Users</h1>

        {blockedUsers.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              You haven't blocked any users yet
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {blockedUsers.map((blockedUser) => (
              <Card
                key={blockedUser.id}
                className="p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold">{blockedUser.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {blockedUser.email}
                  </p>
                </div>
                <Button
                  onClick={() => handleUnblock(blockedUser.id)}
                  variant="outline"
                  size="sm"
                  className="bg-transparent"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Unblock
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
