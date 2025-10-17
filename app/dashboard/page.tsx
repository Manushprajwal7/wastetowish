"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  DocumentData,
  QueryDocumentSnapshot,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Item } from "@/lib/types";
import {
  Heart,
  Package,
  MessageSquare,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { DashboardSkeleton } from "@/components/ui/loading-skeleton";
import { ProtectedRoute } from "@/components/protected-route";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    itemsDonated: 0,
    requestsReceived: 0,
    requestsSent: 0,
    ecoPoints: 0,
  });
  const [recentItems, setRecentItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Dashboard useEffect triggered", { authLoading, user });
    if (authLoading || !user) {
      console.log("Dashboard: User not ready", { authLoading, user });
      return;
    }

    setLoading(true);
    console.log("Dashboard: Setting up listeners for user:", user?.id);

    // Listen for real-time updates to items
    const itemsRef = collection(db, "items");
    const itemsQuery = query(itemsRef, where("ownerId", "==", user.id));

    const unsubscribeItems = onSnapshot(
      itemsQuery,
      (snapshot) => {
        console.log("Items snapshot received, size:", snapshot.size);
        const items = snapshot.docs.map(
          (doc: QueryDocumentSnapshot<DocumentData>) => ({
            id: doc.id,
            ...doc.data(),
          })
        ) as Item[];

        console.log("Items data:", items);

        // Sort and limit items to only what we need
        const sortedItems = items
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
          .slice(0, 3);

        console.log("Sorted items:", sortedItems);

        setRecentItems(sortedItems);
        setStats((prev) => ({
          ...prev,
          itemsDonated: items.length,
          ecoPoints: user.ecoPoints || 0,
        }));

        // Only set loading to false on first load
        if (loading) {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Error listening to items:", error);
        if (loading) {
          setLoading(false);
        }
      }
    );

    // Listen for real-time updates to received requests
    const receivedRef = collection(db, "requests");
    const receivedQuery = query(
      receivedRef,
      where("receiverId", "==", user.id)
    );

    const unsubscribeReceived = onSnapshot(
      receivedQuery,
      (snapshot) => {
        console.log("Received requests snapshot, size:", snapshot.size);
        setStats((prev) => ({
          ...prev,
          requestsReceived: snapshot.size,
        }));
      },
      (error) => {
        console.error("Error listening to received requests:", error);
      }
    );

    // Listen for real-time updates to sent requests
    const sentRef = collection(db, "requests");
    const sentQuery = query(sentRef, where("senderId", "==", user.id));

    const unsubscribeSent = onSnapshot(
      sentQuery,
      (snapshot) => {
        console.log("Sent requests snapshot, size:", snapshot.size);
        setStats((prev) => ({
          ...prev,
          requestsSent: snapshot.size,
        }));
      },
      (error) => {
        console.error("Error listening to sent requests:", error);
      }
    );

    // Set loading to false after initial setup
    setTimeout(() => {
      if (loading) {
        setLoading(false);
      }
    }, 2000);

    // Clean up listeners
    return () => {
      console.log("Dashboard: Cleaning up listeners");
      unsubscribeItems();
      unsubscribeReceived();
      unsubscribeSent();
    };
  }, [user, authLoading, loading]);

  // Wrap content with ProtectedRoute
  return (
    <ProtectedRoute>
      {authLoading || loading ? (
        <DashboardSkeleton />
      ) : !user ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-lg mb-4">
              Please sign in to view your dashboard
            </p>
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">
                Welcome back, {user.name}!
              </h1>
              <p className="text-muted-foreground">
                Here's your sustainability impact at a glance
              </p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                Refresh Data
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-muted-foreground">
                    Items Donated
                  </h3>
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <p className="text-3xl font-bold">{stats.itemsDonated}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Total items shared
                </p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-muted-foreground">
                    Requests Received
                  </h3>
                  <Heart className="w-5 h-5 text-primary" />
                </div>
                <p className="text-3xl font-bold">{stats.requestsReceived}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  People interested in your items
                </p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-muted-foreground">
                    Requests Sent
                  </h3>
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <p className="text-3xl font-bold">{stats.requestsSent}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Items you've requested
                </p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-muted-foreground">
                    Eco Points
                  </h3>
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <p className="text-3xl font-bold">{stats.ecoPoints}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Sustainability score
                </p>
              </div>
            </div>

            {/* Recent Items */}
            <div className="bg-card border border-border rounded-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Recent Items</h2>
                <Link href="/my-items">
                  <Button variant="ghost" size="sm" className="gap-2">
                    View All
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

              {recentItems.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    No items donated yet
                  </p>
                  <Link href="/add-item">
                    <Button>Donate Your First Item</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentItems.map((item) => {
                    console.log("Rendering item:", item);
                    return (
                      <div
                        key={item.id}
                        className="flex items-start justify-between p-4 bg-muted rounded-lg"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.description}
                          </p>
                          <div className="flex gap-2 mt-3">
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              {item.category}
                            </span>
                            <span className="text-xs bg-secondary/10 text-secondary-foreground px-2 py-1 rounded">
                              {item.condition}
                            </span>
                          </div>
                          {item.imageURL && (
                            <div className="mt-2">
                              <img
                                src={item.imageURL}
                                alt={item.title}
                                className="w-16 h-16 object-cover rounded"
                                onError={(e) => {
                                  // Handle broken image links
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = "none";
                                }}
                              />
                            </div>
                          )}
                        </div>
                        <Link href={`/item/${item.id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-6">
              <Link href="/add-item">
                <Button className="w-full h-24 flex flex-col items-center justify-center gap-2">
                  <Package className="w-6 h-6" />
                  <span>Donate Item</span>
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button
                  variant="outline"
                  className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-transparent"
                >
                  <Heart className="w-6 h-6" />
                  <span>Browse Items</span>
                </Button>
              </Link>
              <Link href="/requests">
                <Button
                  variant="outline"
                  className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-transparent"
                >
                  <MessageSquare className="w-6 h-6" />
                  <span>View Requests</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
