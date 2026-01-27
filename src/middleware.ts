import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getJWTSecret } from "@/lib/jwt";
import { isAdminRole, isRoleMatch } from "@/lib/roles";

const JWT_SECRET = getJWTSecret();

// Define protected routes and their required permissions
const PROTECTED_ROUTES = {
  "/dashboard-admin": ["admin"],
  "/dashboard-kesiswaan": ["kesiswaan"],
  "/dashboard-siswa": ["siswa"],
  "/dashboard-osis": ["osis"],
  "/dashboard-ppdb": ["ppdb_admin"],
  "/dashboard-pembina-osis": ["pembina_osis", "admin"],
};

// Routes that should be excluded from maintenance mode
const MAINTENANCE_EXCLUDED_ROUTES = [
  "/maintenance",
  "/api",
  "/login",
  "/dashboard-admin",
  "/_next",
  "/icons",
  "/favicon",
];

// Security headers
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent XSS attacks
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY");

  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Referrer policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Content Security Policy
  if (process.env.NODE_ENV === "production") {
    // Allow the specific font CDN, Lottie WASM CDN, Instagram framing, and enable Vercel speed insights domain in connect-src
    // Also add Google Maps-related origins to support embedded maps and Maps JS API
    response.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' cdn.emailjs.com https://cdn.jsdelivr.net https://maps.googleapis.com https://maps.gstatic.com https://flowise.zeabur.app; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' fonts.gstatic.com https://r2cdn.perplexity.ai; img-src 'self' data: https: https://maps.gstatic.com https://i.ytimg.com https://*.googleusercontent.com; connect-src 'self' api.emailjs.com https://va.vercel-scripts.com https://cdn.jsdelivr.net https://maps.googleapis.com https://flowise.zeabur.app; frame-src 'self' https://www.instagram.com https://www.google.com https://maps.google.com https://www.google.com/maps https://flowise.zeabur.app https://www.youtube.com https://youtube.com https://youtu.be https://www.youtube-nocookie.com https://drive.google.com https://docs.google.com https://drive.googleusercontent.com;"
    );
  }

  return response;
}

// Get client IP for additional security
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const real = request.headers.get("x-real-ip");
  const cfConnectingIP = request.headers.get("cf-connecting-ip"); // Cloudflare

  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  if (forwarded) {
    const ip = forwarded.split(",")[0].trim();
    // Normalize IPv6 localhost
    if (ip === "::1") {
      return "localhost-ipv6";
    }
    return ip;
  }
  if (real) {
    return real;
  }

  return "127.0.0.1";
}

// Helper to check if IP is localhost variant
function isLocalhostIP(ip: string): boolean {
  return (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip === "localhost-ipv6" ||
    ip === "localhost-dev" ||
    ip.startsWith("localhost")
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const clientIP = getClientIP(request);

  // Check for maintenance mode (using cookie-based flag for edge runtime compatibility)
  const maintenanceEnabled =
    request.cookies.get("maintenance-mode")?.value === "true";
  const isExcludedFromMaintenance = MAINTENANCE_EXCLUDED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (maintenanceEnabled && !isExcludedFromMaintenance) {
    // Check if admin is logged in (they can bypass maintenance)
    const token = request.cookies.get("auth-token")?.value;
    let isAdmin = false;

    if (token) {
      try {
        const { payload: decoded } = await jwtVerify(token, JWT_SECRET);
        isAdmin = isAdminRole(decoded.role as string);
      } catch {
        // Token invalid, not admin
      }
    }

    if (!isAdmin) {
      const maintenanceUrl = new URL("/maintenance", request.url);
      const response = NextResponse.redirect(maintenanceUrl);
      return addSecurityHeaders(response);
    }
  }

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
      loginUrl.searchParams.set("error", "authentication_required");

      const response = NextResponse.redirect(loginUrl);
      return addSecurityHeaders(response);
    }

    try {
      // Verify token
      const { payload: decoded } = await jwtVerify(token, JWT_SECRET);

      // Additional security checks

      // IP Binding Check - Prevent session hijacking
      // Token contains the IP from login, verify it matches current request IP
      if (decoded.ip && decoded.ip !== clientIP) {
        // Allow localhost variations (both in development and production for local testing)
        const isLocalhost =
          isLocalhostIP(decoded.ip as string) && isLocalhostIP(clientIP);

        if (!isLocalhost) {
          const loginUrl = new URL("/login", request.url);
          loginUrl.searchParams.set("error", "session_invalid");

          const response = NextResponse.redirect(loginUrl);
          response.cookies.delete("auth-token");
          return addSecurityHeaders(response);
        }
      }

      // Check token age (optional: force re-login after certain time)
      const tokenAge = Date.now() / 1000 - (decoded.iat as number);
      if (tokenAge > 24 * 60 * 60) {
        // 24 hours
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("error", "token_expired");

        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete("auth-token");
        return addSecurityHeaders(response);
      }

      // Check if user has required role
      const allowedRoles =
        PROTECTED_ROUTES[protectedRoute as keyof typeof PROTECTED_ROUTES];
      if (!isRoleMatch(decoded.role as string, allowedRoles)) {
        // Redirect to unauthorized page
        const unauthorizedUrl = new URL("/unauthorized", request.url);
        const response = NextResponse.redirect(unauthorizedUrl);
        return addSecurityHeaders(response);
      }

      // Add user info to headers for use in components
      const response = NextResponse.next();
      response.headers.set("x-user-id", decoded.userId as string);
      response.headers.set("x-user-role", decoded.role as string);
      response.headers.set(
        "x-user-permissions",
        JSON.stringify(decoded.permissions)
      );

      return addSecurityHeaders(response);
    } catch (error) {
      console.error(
        `[SECURITY] Token verification error from IP ${clientIP}:`,
        error
      );

      // Redirect to login if token is invalid
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "invalid_token");

      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("auth-token");
      return addSecurityHeaders(response);
    }
  }

  // If user is logged in and tries to access login page, redirect to appropriate dashboard
  if (pathname === "/login") {
    const token = request.cookies.get("auth-token")?.value;

    if (token) {
      try {
        const { payload: decoded } = await jwtVerify(token, JWT_SECRET);

        // Redirect to appropriate dashboard based on role (normalize to lowercase for URLs)
        const decodedRoleStr = String(decoded.role || "").toLowerCase();
        let dashboardUrl = `/dashboard-${decodedRoleStr}`;
        if (decodedRoleStr === "ppdb_admin") {
          dashboardUrl = "/dashboard-ppdb";
        }

        const response = NextResponse.redirect(
          new URL(dashboardUrl, request.url)
        );
        return addSecurityHeaders(response);
      } catch (error) {
        // Token is invalid, let them access login page
        console.error("Token verification error:", error);

        const response = NextResponse.next();
        response.cookies.delete("auth-token");
        return addSecurityHeaders(response);
      }
    }
  }

  const response = NextResponse.next();
  return addSecurityHeaders(response);
}

export const config = {
  matcher: [
    "/dashboard-admin/:path*",
    "/dashboard-kesiswaan/:path*",
    "/dashboard-siswa/:path*",
    "/dashboard-osis/:path*",
    "/dashboard-ppdb/:path*",
    "/dashboard-pembina-osis/:path*",
    "/login",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
