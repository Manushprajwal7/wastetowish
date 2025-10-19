"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Package,
  Heart,
  MessageSquare,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { DashboardSkeleton } from "@/components/ui/loading-skeleton";

// Dynamically import Supabase utilities only on client side
let getItemsByOwner: Function | null = null;

try {
  const supabaseUtils = require("@/lib/supabase-utils");
  getItemsByOwner = supabaseUtils.getItemsByOwner;
} catch (error) {
  console.warn("Supabase utilities not available during build time");
}

interface SupabaseItem {
  id: number;
  title: string;
  description: string;
  category: string;
  condition: string;
  location: string;
  image_url: string;
  owner_id: string;
  owner_name: string;
  status: string;
  created_at: string;
}

export function SupabaseDashboard() {
  const { user, firebaseUser, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    itemsDonated: 0,
    requestsReceived: 0,
    requestsSent: 0,
    ecoPoints: 0,
  });
  const [recentItems, setRecentItems] = useState<SupabaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("SupabaseDashboard useEffect triggered", {
      authLoading,
      user,
      firebaseUser,
    });
    if (authLoading) {
      console.log("SupabaseDashboard: Auth still loading");
      return;
    }

    if (!user || !firebaseUser) {
      console.log("SupabaseDashboard: No user authenticated");
      setLoading(false);
      return;
    }

    // Check if Supabase is available
    if (!getItemsByOwner) {
      setError("Supabase is not configured. Dashboard is unavailable.");
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(
          "SupabaseDashboard: Fetching data for user:",
          firebaseUser.uid
        );

        // Fetch items for the current user
        const itemsResult = await getItemsByOwner(firebaseUser.uid);
        console.log("Items result:", itemsResult);

        if (itemsResult.success) {
          // Sort and limit items to only what we need
          const sortedItems = itemsResult.data
            .sort(
              (a: SupabaseItem, b: SupabaseItem) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            )
            .slice(0, 3);

          console.log("Sorted items:", sortedItems);

          setRecentItems(sortedItems);
          setStats((prev) => ({
            ...prev,
            itemsDonated: itemsResult.data.length,
            ecoPoints: user.ecoPoints || 0,
          }));
        } else {
          console.error("Failed to fetch items:", itemsResult.error);
          setError(itemsResult.error || "Failed to fetch items");
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, firebaseUser, authLoading]);

  if (authLoading || loading) {
    return <DashboardSkeleton />;
  }

  if (!user || !firebaseUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg mb-4">Please sign in to view your dashboard</p>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {user.name}!
          </h1>
          <p className="text-muted-foreground">
            Here's your sustainability impact at a glance
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
            <p className="text-destructive">{error}</p>
          </div>
        )}

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
              <p className="text-muted-foreground mb-4">No items donated yet</p>
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
                      {item.image_url && (
                        <div className="mt-2">
                          {/* Use optimized image component */}
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-16 h-16 object-cover rounded"
                            loading="lazy"
                            onError={(e) => {
                              console.error(
                                "Error loading image:",
                                item.image_url
                              );
                              // Handle broken image links
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                            }}
                            onLoad={(e) => {
                              console.log(
                                "Image loaded successfully:",
                                item.image_url
                              );
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
            <Button className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-green-600 text-white hover:bg-green-700">
              <Package className="w-6 h-6" />
              <span>Donate Item</span>
            </Button>
          </Link>
          <Link href="/marketplace">
            <Button className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-green-600 text-white hover:bg-green-700">
              <Heart className="w-6 h-6" />
              <span>Browse Items</span>
            </Button>
          </Link>
          <Link href="/requests">
            <Button className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-green-600 text-white hover:bg-green-700">
              <MessageSquare className="w-6 h-6" />
              <span>View Requests</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
