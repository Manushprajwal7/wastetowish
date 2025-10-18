"use client";

import Link from "next/link";
import { useAuth } from "./auth-context";
import { Button } from "@/components/ui/button";
import { Leaf, User, LogOut, MessageSquare, Trophy, Heart } from "lucide-react";
import { NotificationBell } from "./notification-bell";
import { useRouter } from "next/navigation";

export function Navbar() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      // Optionally show an error message to the user
    }
  };

  const handleProfileClick = () => {
    router.push("/profile");
  };

  const isAdmin =
    user?.email && process.env.NEXT_PUBLIC_ADMIN_EMAILS?.includes(user.email);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl text-primary"
          >
            <Leaf className="w-6 h-6" />
            Waste to Wish
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm hover:text-primary transition"
                >
                  Dashboard
                </Link>
                <Link
                  href="/marketplace"
                  className="text-sm hover:text-primary transition"
                >
                  Marketplace
                </Link>
                <Link
                  href="/my-items"
                  className="text-sm hover:text-primary transition"
                >
                  My Items
                </Link>
                <Link
                  href="/requests"
                  className="text-sm hover:text-primary transition"
                >
                  Requests
                </Link>
                <Link
                  href="/chat"
                  className="text-sm hover:text-primary transition"
                >
                  Messages
                </Link>
                <Link
                  href="/leaderboard"
                  className="text-sm hover:text-primary transition"
                >
                  Leaderboard
                </Link>
                <Link
                  href="/wishlist"
                  className="text-sm hover:text-primary transition"
                >
                  Wishlist
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="text-sm hover:text-primary transition font-semibold"
                  >
                    Admin
                  </Link>
                )}
              </>
            ) : null}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <NotificationBell />

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleProfileClick}
                >
                  <User className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link href="/signup">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
