"use client";

import { useAuth } from "@/components/auth-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Leaf, Heart, Users, Zap } from "lucide-react";
import { Suspense } from "react";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

// Separate components for authenticated and unauthenticated views
function AuthenticatedView({ user }: { user: any }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Welcome back, <span className="text-primary">{user.name}</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Your eco points:{" "}
            <span className="font-bold text-primary">{user.ecoPoints}</span>
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/marketplace">
              <Button size="lg" className="gap-2">
                <Leaf className="w-5 h-5" />
                Browse Items
              </Button>
            </Link>
            <Link href="/add-item">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 bg-transparent"
              >
                <Heart className="w-5 h-5" />
                Donate Item
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="bg-card border border-border rounded-lg p-6">
            <Leaf className="w-8 h-8 text-primary mb-4" />
            <h3 className="font-bold text-lg mb-2">Share & Reuse</h3>
            <p className="text-sm text-muted-foreground">
              Give unwanted items a second life by connecting with others in
              your community.
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <Users className="w-8 h-8 text-primary mb-4" />
            <h3 className="font-bold text-lg mb-2">Build Community</h3>
            <p className="text-sm text-muted-foreground">
              Connect with like-minded people who value sustainability and
              reuse.
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <Zap className="w-8 h-8 text-primary mb-4" />
            <h3 className="font-bold text-lg mb-2">Earn Eco Points</h3>
            <p className="text-sm text-muted-foreground">
              Earn rewards for every successful donation and unlock
              achievements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function UnauthenticatedView() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Leaf className="w-16 h-16 text-primary" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Turn Waste into <span className="text-primary">Wishes</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
            A sustainability-driven platform where you can give away unwanted
            items to others who need them. Share, connect, and make a
            difference.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                <Leaf className="w-5 h-5" />
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-card border border-border rounded-lg p-8">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Leaf className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold text-lg mb-3">Reduce Waste</h3>
            <p className="text-muted-foreground">
              Keep items out of landfills by finding them new homes where
              they'll be valued and used.
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-8">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold text-lg mb-3">Help Others</h3>
            <p className="text-muted-foreground">
              Connect with people who need what you have and make their day by
              sharing generously.
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-8">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold text-lg mb-3">Join Community</h3>
            <p className="text-muted-foreground">
              Be part of a growing movement of people committed to
              sustainability and community.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function HomeContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <AuthenticatedView user={user} />;
  }

  return <UnauthenticatedView />;
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}
