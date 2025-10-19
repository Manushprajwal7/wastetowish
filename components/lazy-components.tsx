"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Lazy load heavy components
export const LazyNavbar = dynamic(
  () => import("@/components/navbar").then((mod) => ({ default: mod.Navbar })),
  {
    loading: () => (
      <div className="h-16 bg-background border-b border-border animate-pulse" />
    ),
    ssr: false,
  }
);

export const LazyFooter = dynamic(
  () => import("@/app/footer").then((mod) => ({ default: mod.Footer })),
  {
    loading: () => <div className="h-32 bg-muted animate-pulse" />,
    ssr: false,
  }
);

export const LazyAnalytics = dynamic(
  () =>
    import("@vercel/analytics/next").then((mod) => ({
      default: mod.Analytics,
    })),
  {
    ssr: false,
  }
);

// Lazy load dashboard components
export const LazyDashboard = dynamic(() => import("@/app/dashboard/page"), {
  loading: () => <LoadingSpinner />,
  ssr: false,
});

export const LazyMarketplace = dynamic(() => import("@/app/marketplace/page"), {
  loading: () => <LoadingSpinner />,
  ssr: false,
});

export const LazyAddItem = dynamic(() => import("@/app/add-item/page"), {
  loading: () => <LoadingSpinner />,
  ssr: false,
});

// Lazy load auth components
export const LazyLogin = dynamic(() => import("@/app/login/page"), {
  loading: () => <LoadingSpinner />,
  ssr: false,
});

export const LazySignup = dynamic(() => import("@/app/signup/page"), {
  loading: () => <LoadingSpinner />,
  ssr: false,
});

// Lazy load storage debug (only in development)
export const LazyStorageDebug = dynamic(
  () =>
    import("@/components/storage-debug").then((mod) => ({
      default: mod.StorageDebug,
    })),
  {
    loading: () => null,
    ssr: false,
  }
);

// Conditional lazy loading wrapper
export function ConditionalLazyComponent({
  condition,
  component: Component,
  fallback,
}: {
  condition: boolean;
  component: React.ComponentType;
  fallback?: React.ReactNode;
}) {
  if (!condition) {
    return fallback || null;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Component />
    </Suspense>
  );
}
