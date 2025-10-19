"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { SupabaseMarketplace } from "@/components/supabase-marketplace";

export default function MarketplacePage() {
  const [useSupabase] = useState(true);

  return (
    <ProtectedRoute>
      {useSupabase ? (
        <SupabaseMarketplace />
      ) : (
        // Keep the original Firebase implementation as fallback
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-lg mb-4">
              Marketplace is currently using Firebase backend
            </p>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
