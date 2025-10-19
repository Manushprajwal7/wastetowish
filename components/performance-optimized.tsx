"use client";

import { memo, Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Memoized loading skeleton for better performance
export const LoadingSkeleton = memo(function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full animate-pulse" />
          </div>
          <div className="h-8 bg-muted rounded animate-pulse mb-4 max-w-md mx-auto" />
          <div className="h-4 bg-muted rounded animate-pulse mb-8 max-w-lg mx-auto" />
          <div className="flex gap-4 justify-center">
            <div className="h-12 w-32 bg-muted rounded animate-pulse" />
            <div className="h-12 w-24 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
});

// Optimized loading component for cards
export const CardSkeleton = memo(function CardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg p-6 animate-pulse">
      <div className="w-8 h-8 bg-muted rounded mb-4" />
      <div className="h-6 bg-muted rounded mb-2" />
      <div className="h-4 bg-muted rounded mb-4" />
      <div className="h-3 bg-muted rounded" />
    </div>
  );
});

// Optimized loading component for dashboard
export const DashboardSkeleton = memo(function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-10 bg-muted rounded animate-pulse mb-2 max-w-md" />
          <div className="h-4 bg-muted rounded animate-pulse max-w-lg" />
        </div>

        {/* Stats grid skeleton */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>

        {/* Recent items skeleton */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="h-6 bg-muted rounded mb-6 max-w-32" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-start justify-between p-4 bg-muted rounded-lg animate-pulse"
              >
                <div className="flex-1">
                  <div className="h-5 bg-muted rounded mb-2 max-w-48" />
                  <div className="h-4 bg-muted rounded mb-3 max-w-64" />
                  <div className="flex gap-2">
                    <div className="h-6 w-16 bg-muted rounded" />
                    <div className="h-6 w-20 bg-muted rounded" />
                  </div>
                </div>
                <div className="h-8 w-16 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

// Performance-optimized wrapper for components
export function PerformanceWrapper({
  children,
  fallback = <LoadingSkeleton />,
  condition = true,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  condition?: boolean;
}) {
  if (!condition) {
    return <>{fallback}</>;
  }

  return <Suspense fallback={fallback}>{children}</Suspense>;
}

// Optimized error boundary component
export function OptimizedErrorBoundary({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <ErrorBoundary
      fallback={
        fallback || (
          <div className="p-4 text-center text-destructive">
            Something went wrong
          </div>
        )
      }
    >
      {children}
    </ErrorBoundary>
  );
}

// Simple error boundary implementation
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}
