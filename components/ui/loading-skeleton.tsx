import { cn } from "@/lib/utils";

export function LoadingSkeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="h-10 w-64 bg-muted rounded mb-2"></div>
          <div className="h-5 w-80 bg-muted rounded"></div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 w-32 bg-muted rounded"></div>
                <div className="h-5 w-5 bg-muted rounded-full"></div>
              </div>
              <div className="h-8 w-10 bg-muted rounded mb-2"></div>
              <div className="h-3 w-24 bg-muted rounded"></div>
            </div>
          ))}
        </div>

        {/* Recent Items Skeleton */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="h-6 w-32 bg-muted rounded"></div>
            <div className="h-8 w-24 bg-muted rounded"></div>
          </div>

          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex items-start justify-between p-4 bg-muted rounded-lg"
              >
                <div className="flex-1">
                  <div className="h-5 w-40 bg-muted rounded mb-2"></div>
                  <div className="h-4 w-64 bg-muted rounded mb-3"></div>
                  <div className="flex gap-2">
                    <div className="h-5 w-16 bg-muted rounded"></div>
                    <div className="h-5 w-20 bg-muted rounded"></div>
                  </div>
                </div>
                <div className="h-8 w-16 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Skeleton */}
        <div className="grid md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MarketplaceSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="h-8 w-40 bg-muted rounded mb-6"></div>

          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <div className="h-10 bg-muted rounded pl-10"></div>
            </div>
            <div className="h-10 w-32 bg-muted rounded"></div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-10 w-20 bg-muted rounded-full"></div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-lg overflow-hidden h-full flex flex-col"
            >
              <div className="w-full h-48 bg-muted"></div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="h-5 w-32 bg-muted rounded mb-2"></div>
                <div className="h-4 w-full bg-muted rounded mb-1"></div>
                <div className="h-4 w-4/5 bg-muted rounded mb-3"></div>
                <div className="flex gap-2 mb-3">
                  <div className="h-5 w-16 bg-muted rounded"></div>
                  <div className="h-5 w-20 bg-muted rounded"></div>
                </div>
                <div className="mt-auto">
                  <div className="h-3 w-32 bg-muted rounded mb-1"></div>
                  <div className="h-3 w-24 bg-muted rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
