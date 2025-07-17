import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-super-secret-key-change-this-in-production"
);

// Define protected routes and their required permissions
// Each role can only access their own dashboard
const PROTECTED_ROUTES = {
  "/dashboard-admin": ["admin"],
  "/dashboard-kesiswaan": ["kesiswaan"],
  "/dashboard-siswa": ["siswa"],
  "/dashboard-osis": ["osis"],
  "/dashboard-ppdb": ["ppdb-officer"],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is protected
  const protectedRoute = Object.keys(PROTECTED_ROUTES).find((route) =>
    pathname.startsWith(route)
  );

  if (protectedRoute) {
    // Get token from cookies
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      // Redirect to login if no token
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Verify token
      const { payload: decoded } = await jwtVerify(token, JWT_SECRET);

      // Check if user has required role
      const allowedRoles =
        PROTECTED_ROUTES[protectedRoute as keyof typeof PROTECTED_ROUTES];
      if (!allowedRoles.includes(decoded.role as string)) {
        // Redirect to unauthorized page
        const unauthorizedUrl = new URL("/unauthorized", request.url);
        return NextResponse.redirect(unauthorizedUrl);
      }

      // Add user info to headers for use in components
      const response = NextResponse.next();
      response.headers.set("x-user-id", decoded.userId as string);
      response.headers.set("x-user-role", decoded.role as string);
      response.headers.set(
        "x-user-permissions",
        JSON.stringify(decoded.permissions)
      );

      return response;
    } catch (error) {
      console.error("Token verification error in middleware:", error);
      // Redirect to login if token is invalid
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "invalid_token");
      return NextResponse.redirect(loginUrl);
    }
  }

  // If user is logged in and tries to access login page, redirect to appropriate dashboard
  if (pathname === "/login") {
    const token = request.cookies.get("auth-token")?.value;

    if (token) {
      try {
        const { payload: decoded } = await jwtVerify(token, JWT_SECRET);

        // Redirect to appropriate dashboard based on role
        const dashboardUrl = `/dashboard-${decoded.role}`;
        return NextResponse.redirect(new URL(dashboardUrl, request.url));
      } catch (error) {
        // Token is invalid, let them access login page
        console.error("Token verification error:", error);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard-admin/:path*",
    "/dashboard-kesiswaan/:path*",
    "/dashboard-siswa/:path*",
    "/dashboard-osis/:path*",
    "/dashboard-ppdb/:path*",
    "/login",
  ],
};
