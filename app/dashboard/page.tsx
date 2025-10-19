"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-context";
import { ProtectedRoute } from "@/components/protected-route";
import { SupabaseDashboard } from "@/components/supabase-items";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [useSupabase, setUseSupabase] = useState(true);

  // For now, we'll use Supabase by default since that's what we're implementing
  // In a real app, you might want to check feature flags or user preferences

  return (
    <ProtectedRoute>
      {useSupabase ? (
        <SupabaseDashboard />
      ) : (
        // Keep the original Firebase implementation as fallback
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-lg mb-4">
              Dashboard is currently using Firebase backend
            </p>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
