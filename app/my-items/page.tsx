"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Package, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProtectedRoute } from "@/components/protected-route";

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

export default function MyItemsPage() {
  const { user, firebaseUser, loading: authLoading } = useAuth();
  const [items, setItems] = useState<SupabaseItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<SupabaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Get unique statuses for filters
  const statuses = Array.from(new Set(items.map((item) => item.status))).sort();

  useEffect(() => {
    if (authLoading || !user || !firebaseUser) {
      return;
    }

    // Check if Supabase is available
    if (!getItemsByOwner) {
      setError("Supabase is not configured. My items page is unavailable.");
      setLoading(false);
      return;
    }

    const fetchUserItems = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await getItemsByOwner(firebaseUser.uid);
        console.log("User items result:", result);

        if (result.success) {
          setItems(result.data);
          setFilteredItems(result.data);
        } else {
          console.error("Failed to fetch user items:", result.error);
          setError(result.error);
        }
      } catch (err) {
        console.error("Error fetching user items:", err);
        setError("Failed to load your items. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserItems();
  }, [user, firebaseUser, authLoading]);

  // Apply filters whenever search term or filters change
  useEffect(() => {
    let filtered = items;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    setFilteredItems(filtered);
  }, [searchTerm, statusFilter, items]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !firebaseUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg mb-4">Please sign in to view your items</p>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-4xl font-bold mb-2">My Items</h1>
                <p className="text-muted-foreground">
                  Manage the items you've donated to the community
                </p>
              </div>
              <Link href="/add-item">
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add New Item
                </Button>
              </Link>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
              <p className="text-destructive">{error}</p>
            </div>
          )}

          {/* Search and Filters */}
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search your items..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Items List */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="bg-card border border-border rounded-lg p-6 animate-pulse"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="aspect-square bg-muted rounded-lg w-24 h-24"></div>
                    <div className="flex-1">
                      <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-full mb-3"></div>
                      <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                      <div className="flex gap-2">
                        <div className="h-6 bg-muted rounded w-16"></div>
                        <div className="h-6 bg-muted rounded w-16"></div>
                        <div className="h-6 bg-muted rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No items found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "You haven't donated any items yet"}
              </p>
              <Link href="/add-item">
                <Button>
                  {searchTerm || statusFilter !== "all"
                    ? "Clear Filters"
                    : "Donate Your First Item"}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {item.image_url ? (
                      <div className="aspect-square rounded-lg overflow-hidden w-24 h-24">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                          }}
                        />
                      </div>
                    ) : (
                      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center w-24 h-24">
                        <span className="text-muted-foreground text-sm">
                          No Image
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                        <h3 className="text-xl font-semibold">{item.title}</h3>
                        <Link href={`/item/${item.id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </div>
                      <p className="text-muted-foreground mb-3">
                        {item.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {item.category}
                        </span>
                        <span className="text-xs bg-secondary/10 text-secondary-foreground px-2 py-1 rounded">
                          {item.condition}
                        </span>
                        <span className="text-xs bg-muted/10 text-muted-foreground px-2 py-1 rounded">
                          {item.status.charAt(0).toUpperCase() +
                            item.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span>
                          Added on{" "}
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
