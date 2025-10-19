"use client";

import { useEffect } from "react";

export function PerformanceMonitor() {
  useEffect(() => {
    // Only run in production and browser environment
    if (
      process.env.NODE_ENV !== "production" ||
      typeof window === "undefined"
    ) {
      return;
    }

    // Monitor Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Log LCP (Largest Contentful Paint)
        if (entry.entryType === "largest-contentful-paint") {
          console.log("LCP:", entry.startTime);
        }

        // Log FID (First Input Delay)
        if (entry.entryType === "first-input") {
          console.log("FID:", entry.processingStart - entry.startTime);
        }

        // Log CLS (Cumulative Layout Shift)
        if (entry.entryType === "layout-shift" && !entry.hadRecentInput) {
          console.log("CLS:", entry.value);
        }
      }
    });

    // Observe performance entries
    try {
      observer.observe({
        entryTypes: ["largest-contentful-paint", "first-input", "layout-shift"],
      });
    } catch (error) {
      console.warn("Performance monitoring not supported:", error);
    }

    // Monitor navigation timing
    const navigationTiming = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming;
    if (navigationTiming) {
      console.log("Navigation timing:", {
        domContentLoaded:
          navigationTiming.domContentLoadedEventEnd -
          navigationTiming.domContentLoadedEventStart,
        loadComplete:
          navigationTiming.loadEventEnd - navigationTiming.loadEventStart,
        totalTime: navigationTiming.loadEventEnd - navigationTiming.fetchStart,
      });
    }

    // Monitor resource loading
    const resourceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 1000) {
          // Log slow resources (>1s)
          console.warn("Slow resource:", {
            name: entry.name,
            duration: entry.duration,
            type: entry.initiatorType,
          });
        }
      }
    });

    try {
      resourceObserver.observe({ entryTypes: ["resource"] });
    } catch (error) {
      console.warn("Resource monitoring not supported:", error);
    }

    // Cleanup
    return () => {
      observer.disconnect();
      resourceObserver.disconnect();
    };
  }, []);

  return null;
}

// Hook for monitoring component performance
export function usePerformanceMonitor(componentName: string) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      if (duration > 100) {
        // Log components that take >100ms to render
        console.warn(
          `Slow component render: ${componentName} took ${duration.toFixed(
            2
          )}ms`
        );
      }
    };
  }, [componentName]);
}

// Hook for monitoring Firebase performance
export function useFirebasePerformance() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    // Monitor Firebase auth performance
    const authStartTime = performance.now();

    const checkAuthPerformance = () => {
      const authEndTime = performance.now();
      const authDuration = authEndTime - authStartTime;

      if (authDuration > 500) {
        // Log if auth takes >500ms
        console.warn(`Slow Firebase auth: ${authDuration.toFixed(2)}ms`);
      }
    };

    // Check after a delay to allow auth to complete
    const timeoutId = setTimeout(checkAuthPerformance, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);
}
