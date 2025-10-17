import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define which routes are protected
const protectedRoutes = [
  "/dashboard",
  "/profile",
  "/settings",
  "/my-items",
  "/add-item",
  "/requests",
  "/chat",
  "/wishlist",
  "/ratings",
  "/report",
  "/admin",
];

// Define which routes are public (everyone can access)
const publicRoutes = [
  "/",
  "/login",
  "/signup",
  "/auth/reset-password",
  "/marketplace",
  "/item",
  "/about",
  "/help",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(
    (route) => pathname.startsWith(route) || pathname === route
  );

  // In a real implementation, you would check for a valid session/cookie here
  // For now, we'll just demonstrate the structure
  const isLoggedIn =
    request.cookies.get("firebaseSession") || request.cookies.get("authToken");

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/marketplace", request.url));
  }

  // Redirect unauthenticated users to login page for protected routes
  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
