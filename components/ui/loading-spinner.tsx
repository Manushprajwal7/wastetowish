import { cn } from "@/lib/utils";

export function LoadingSpinner({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div
        className={cn(
          "animate-spin rounded-full h-12 w-12 border-b-2 border-primary",
          className
        )}
        {...props}
      />
    </div>
  );
}
