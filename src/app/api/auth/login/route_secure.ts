import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { prisma } from "@/lib/prisma";
import { RateLimiter } from "@/utils/security";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-super-secret-key-change-this-in-production"
);

// Rate limiter untuk login attempts
const loginRateLimiter = new RateLimiter(5, 900000); // 5 attempts per 15 minutes
const accountLockRateLimiter = new RateLimiter(10, 3600000); // 10 attempts per hour before account lock

// Role mapping untuk kompatibilitas dengan auth system lama
const ROLE_MAPPING = {
  ADMIN: "admin",
  KESISWAAN: "kesiswaan",
  SISWA: "siswa",
  OSIS: "osis",
  PPDB_STAFF: "ppdb-officer",
} as const;

// Permission mapping berdasarkan role
const ROLE_PERMISSIONS = {
  ADMIN: ["read", "write", "delete", "manage_users", "view_reports"],
  KESISWAAN: ["read", "write", "manage_students", "view_reports"],
  SISWA: ["read", "view_profile", "submit_assignments"],
  OSIS: ["read", "write", "manage_events", "view_reports"],
  PPDB_STAFF: ["read", "write", "manage_ppdb", "view_applications"],
} as const;

// Get client IP for rate limiting
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const real = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  if (real) {
    return real;
  }

  // Fallback for development
  return "127.0.0.1";
}

// Log security events
async function logSecurityEvent(
  eventType:
    | "LOGIN_SUCCESS"
    | "LOGIN_FAILED"
    | "RATE_LIMITED"
    | "ACCOUNT_LOCKED",
  details: {
    username?: string;
    ip: string;
    userAgent?: string;
    reason?: string;
  }
) {
  try {
    console.log(`[SECURITY] ${eventType}:`, {
      timestamp: new Date().toISOString(),
      ...details,
    });

    // In production, send to security monitoring service
    // await sendToSecurityService({ eventType, ...details });
  } catch (error) {
    console.error("Failed to log security event:", error);
  }
}

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  const userAgent = request.headers.get("user-agent") || "unknown";

  try {
    const body = await request.json();
    const { username, password, role } = body;

    // Validate input
    if (!username || !password || !role) {
      await logSecurityEvent("LOGIN_FAILED", {
        ip: clientIP,
        userAgent,
        reason: "Missing credentials",
      });

      return NextResponse.json(
        { error: "Username, password, and role are required" },
        { status: 400 }
      );
    }

    // Check rate limiting per IP
    if (!loginRateLimiter.isAllowed(clientIP)) {
      const remaining = loginRateLimiter.getRemainingAttempts(clientIP);

      await logSecurityEvent("RATE_LIMITED", {
        username,
        ip: clientIP,
        userAgent,
        reason: `Too many login attempts from IP. Remaining: ${remaining}`,
      });

      return NextResponse.json(
        {
          error: "Too many login attempts. Please try again later.",
          remainingAttempts: remaining,
          retryAfter: 15 * 60, // 15 minutes in seconds
        },
        { status: 429 }
      );
    }

    // Check account-level rate limiting
    const accountKey = `${username}:${role}`;
    if (!accountLockRateLimiter.isAllowed(accountKey)) {
      await logSecurityEvent("ACCOUNT_LOCKED", {
        username,
        ip: clientIP,
        userAgent,
        reason: "Too many failed attempts for this account",
      });

      return NextResponse.json(
        {
          error:
            "Account temporarily locked due to too many failed attempts. Please try again later.",
          retryAfter: 60 * 60, // 1 hour in seconds
        },
        { status: 423 } // Locked
      );
    }

    // Convert role ke format database (misal: admin -> ADMIN)
    const dbRole = Object.keys(ROLE_MAPPING).find(
      (key) => ROLE_MAPPING[key as keyof typeof ROLE_MAPPING] === role
    ) as keyof typeof ROLE_MAPPING;

    if (!dbRole) {
      await logSecurityEvent("LOGIN_FAILED", {
        username,
        ip: clientIP,
        userAgent,
        reason: "Invalid role",
      });

      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Find user by username and role in database
    const user = await prisma.user.findFirst({
      where: {
        username: username,
        role: dbRole,
      },
      include: {
        siswa: true,
        kesiswaan: true,
      },
    });

    if (!user) {
      await logSecurityEvent("LOGIN_FAILED", {
        username,
        ip: clientIP,
        userAgent,
        reason: "User not found",
      });

      return NextResponse.json(
        { error: "Invalid credentials or role" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      await logSecurityEvent("LOGIN_FAILED", {
        username,
        ip: clientIP,
        userAgent,
        reason: "Invalid password",
      });

      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Get user display name
    let displayName = user.username;
    if (user.siswa?.name) {
      displayName = user.siswa.name;
    } else if (user.kesiswaan?.name) {
      displayName = user.kesiswaan.name;
    }

    // Get permissions for role
    const permissions =
      ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS];

    // Create JWT token
    const token = await new SignJWT({
      userId: user.id,
      username: user.username,
      role: ROLE_MAPPING[user.role as keyof typeof ROLE_MAPPING], // Convert back to old format for compatibility
      permissions: permissions,
      iat: Math.floor(Date.now() / 1000),
      ip: clientIP, // Include IP in token for additional security
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h")
      .setIssuedAt()
      .sign(JWT_SECRET);

    // Log successful login
    await logSecurityEvent("LOGIN_SUCCESS", {
      username,
      ip: clientIP,
      userAgent,
    });

    // Return user data (without password)
    const userResponse = {
      id: user.id,
      username: user.username,
      name: displayName,
      role: ROLE_MAPPING[user.role as keyof typeof ROLE_MAPPING],
      email: user.email,
      permissions: permissions,
    };

    const response = NextResponse.json({
      success: true,
      user: userResponse,
      message: "Login successful",
    });

    // Set secure HTTP-only cookie
    const isProduction = process.env.NODE_ENV === "production";
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: isProduction, // true in production
      sameSite: isProduction ? "strict" : "lax", // strict in production
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);

    await logSecurityEvent("LOGIN_FAILED", {
      ip: clientIP,
      userAgent,
      reason: "Internal server error",
    });

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
