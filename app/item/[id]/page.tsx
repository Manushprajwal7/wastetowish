"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-context";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Heart, MessageSquare, Share2 } from "lucide-react";
import { ProtectedRoute } from "@/components/protected-route";

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

export default function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user, firebaseUser, loading: authLoading } = useAuth();
  const [item, setItem] = useState<SupabaseItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [itemId, setItemId] = useState<string | null>(null);

  useEffect(() => {
    // Unwrap the params promise
    params.then((unwrappedParams) => {
      setItemId(unwrappedParams.id);
    });
  }, [params]);

  useEffect(() => {
    if (authLoading || !itemId) {
      return;
    }

    const fetchItem = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("items")
          .select("*")
          .eq("id", itemId)
          .single();

        if (error) {
          console.error("Error fetching item:", error);
          setError("Failed to load item. Please try again.");
          return;
        }

        if (!data) {
          setError("Item not found.");
          return;
        }

        setItem(data);

        // Check if current user is the owner
        if (firebaseUser) {
          setIsOwner(data.owner_id === firebaseUser.uid);
        }
      } catch (err) {
        console.error("Error fetching item:", err);
        setError("Failed to load item. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [itemId, firebaseUser, authLoading]);

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
          <p className="text-lg mb-4">Please sign in to view item details</p>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-6 bg-muted rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-muted rounded-lg"></div>
              <div>
                <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3 mb-6"></div>
                <div className="space-y-2 mb-6">
                  <div className="h-6 bg-muted rounded w-1/4"></div>
                  <div className="h-6 bg-muted rounded w-1/4"></div>
                  <div className="h-6 bg-muted rounded w-1/4"></div>
                </div>
                <div className="h-10 bg-muted rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 inline-block mb-6">
              <p className="text-destructive">{error || "Item not found"}</p>
            </div>
            <Link href="/marketplace">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Marketplace
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image */}
            <div>
              {item.image_url ? (
                <div className="aspect-square rounded-lg overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.parentElement!.innerHTML = `
                        <div class="w-full h-full bg-muted flex items-center justify-center">
                          <span class="text-muted-foreground">No Image Available</span>
                        </div>
                      `;
                    }}
                  />
                </div>
              ) : (
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-muted-foreground">No Image</span>
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">{item.title}</h1>
                <p className="text-muted-foreground mb-6">{item.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Category
                    </h3>
                    <p className="font-medium">{item.category}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Condition
                    </h3>
                    <p className="font-medium">{item.condition}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Location
                    </h3>
                    <p className="font-medium">
                      {item.location || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Status
                    </h3>
                    <p className="font-medium capitalize">{item.status}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-6">
                <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">
                  {item.category}
                </span>
                <span className="text-xs bg-secondary/10 text-secondary-foreground px-3 py-1 rounded-full">
                  {item.condition}
                </span>
                <span className="text-xs bg-muted/10 text-muted-foreground px-3 py-1 rounded-full">
                  {item.status}
                </span>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Listed by</p>
                  <p className="font-medium">{item.owner_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Posted on</p>
                  <p className="font-medium">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {isOwner ? (
                  <Button variant="outline" disabled>
                    Your Item
                  </Button>
                ) : (
                  <>
                    <Button className="flex-1">
                      <Heart className="w-4 h-4 mr-2" />
                      Request Item
                    </Button>
                    <Button variant="outline">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  </>
                )}
                <Button variant="outline">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
