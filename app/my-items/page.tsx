"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Item } from "@/lib/types";
import { Trash2, Edit2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/protected-route";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function MyItemsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;

    setLoading(true);
    const itemsRef = collection(db, "items");
    const q = query(itemsRef, where("ownerId", "==", user.id));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itemsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Item[];
      setItems(itemsData.sort((a, b) => b.createdAt - a.createdAt));
      setLoading(false);
    });

    return unsubscribe;
  }, [user, authLoading]);

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    setDeletingId(itemId);
    try {
      await deleteDoc(doc(db, "items", itemId));
    } catch (err) {
      console.error("Failed to delete item:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleMarkAsCompleted = async (itemId: string) => {
    try {
      await updateDoc(doc(db, "items", itemId), {
        status: "completed",
      });
    } catch (err) {
      console.error("Failed to update item:", err);
    }
  };

  return (
    <ProtectedRoute>
      {authLoading || loading ? (
        <LoadingSpinner />
      ) : !user ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-lg mb-4">Please sign in to view your items</p>
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-primary hover:underline mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">My Items</h1>
              <Link href="/add-item">
                <Button>Add New Item</Button>
              </Link>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg mb-4">
                  You haven't donated any items yet
                </p>
                <Link href="/add-item">
                  <Button>Donate Your First Item</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-card border border-border rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg">{item.title}</h3>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              item.status === "available"
                                ? "bg-green-100 text-green-800"
                                : item.status === "requested"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {item.status === "available"
                              ? "Available"
                              : item.status === "requested"
                              ? "Requested"
                              : "Completed"}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {item.description}
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            {item.category}
                          </span>
                          <span className="text-xs bg-secondary/10 text-secondary-foreground px-2 py-1 rounded">
                            {item.condition}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {item.status === "available" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkAsCompleted(item.id)}
                            className="gap-2"
                          >
                            <Edit2 className="w-4 h-4" />
                            Mark Complete
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteItem(item.id)}
                          disabled={deletingId === item.id}
                          className="gap-2 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
