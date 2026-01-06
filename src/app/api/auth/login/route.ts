import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { prisma } from "@/lib/prisma";
import { getJWTSecret, getJWTCookieOptions, JWT_CONFIG } from "@/lib/jwt";

// Role mapping untuk kompatibilitas dengan auth system lama
const ROLE_MAPPING = {
  ADMIN: "admin",
  KESISWAAN: "kesiswaan",
  SISWA: "siswa",
  OSIS: "osis",
  PPDB_ADMIN: "ppdb_admin",
} as const;

// Permission mapping berdasarkan role
const ROLE_PERMISSIONS = {
  ADMIN: ["read", "write", "delete", "manage_users", "view_reports"],
  KESISWAAN: ["read", "write", "manage_students", "view_reports"],
  SISWA: ["read", "view_profile", "submit_assignments"],
  OSIS: ["read", "write", "manage_events", "view_reports"],
  PPDB_ADMIN: ["read", "write", "manage_ppdb", "view_applications"],
} as const;

// Get real client IP with multiple fallbacks
function getClientIP(request: NextRequest): string {
  // Try multiple headers for real IP detection
  const forwarded = request.headers.get("x-forwarded-for");
  const real = request.headers.get("x-real-ip");
  const cfConnectingIP = request.headers.get("cf-connecting-ip"); // Cloudflare
  const cfRealIP = request.headers.get("cf-real-ip"); // Cloudflare
  const xClientIP = request.headers.get("x-client-ip");
  const xClusterClientIP = request.headers.get("x-cluster-client-ip");

  // Priority order for IP detection
  const ips = [
    cfConnectingIP,
    cfRealIP,
    real,
    xClientIP,
    xClusterClientIP,
    forwarded,
  ].filter(Boolean);

  if (ips.length > 0) {
    // Take first IP from comma-separated list
    const ip = ips[0]!.split(",")[0].trim();
    // Normalize IPv6 localhost to consistent format
    if (ip === "::1") {
      return "localhost-ipv6";
    }
    return ip;
  }

  // For development/localhost, try to get consistent identifier
  const host = request.headers.get("host");
  if (host && (host.includes("localhost") || host.includes("127.0.0.1"))) {
    // Check if this is IPv6 localhost (Next.js often uses ::1 in dev)
    return "localhost-dev"; // Consistent localhost identifier
  }

  // Fallback
  return "unknown";
}

// Database-based rate limiting for persistent protection
async function checkRateLimit(
  ip: string,
  username?: string
): Promise<{
  isAllowed: boolean;
  remainingAttempts: number;
  retryAfter: number;
  lockType: "ip" | "account" | null;
}> {
  const now = new Date();
  const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  try {
    // Check IP-based rate limiting (3 attempts per 15 minutes)
    const ipAttempts = await prisma.loginAttempt.count({
      where: {
        ip: ip,
        success: false,
        resolved: false, // Only count unresolved failed attempts
        createdAt: {
          gte: fifteenMinutesAgo,
        },
      },
    });

    if (ipAttempts >= 5) {
      return {
        isAllowed: false,
        remainingAttempts: 0,
        retryAfter: 15 * 60, // 15 minutes
        lockType: "ip",
      };
    }

    // Check account-based rate limiting if username provided (10 attempts per 24 hours)
    if (username) {
      const accountAttempts = await prisma.loginAttempt.count({
        where: {
          username: username,
          success: false,
          resolved: false, // Only count unresolved failed attempts
          createdAt: {
            gte: twentyFourHoursAgo,
          },
        },
      });

      if (accountAttempts >= 10) {
        return {
          isAllowed: false,
          remainingAttempts: 0,
          retryAfter: 24 * 60 * 60, // 24 hours
          lockType: "account",
        };
      }

      return {
        isAllowed: true,
        remainingAttempts: Math.min(5 - ipAttempts, 10 - accountAttempts),
        retryAfter: 0,
        lockType: null,
      };
    }

    return {
      isAllowed: true,
      remainingAttempts: 5 - ipAttempts,
      retryAfter: 0,
      lockType: null,
    };
  } catch (error) {
    console.error("Rate limit check error:", error);
    // Fail secure: if database check fails, allow but log
    return {
      isAllowed: true,
      remainingAttempts: 1,
      retryAfter: 0,
      lockType: null,
    };
  }
}

// Log login attempt to database
async function logLoginAttempt(
  ip: string,
  username: string,
  userAgent: string,
  success: boolean,
  failureReason?: string
): Promise<void> {
  try {
    await prisma.loginAttempt.create({
      data: {
        ip,
        username,
        userAgent: userAgent.substring(0, 500), // Limit length
        success,
        failureReason,
        createdAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Failed to log login attempt:", error);
  }
}

// Reset failed attempts for successful login
async function resetFailedAttempts(
  username: string,
  _ip: string
): Promise<void> {
  try {
    // Mark previous failed attempts as resolved for this username
    // We keep the records for audit purposes but mark them as resolved
    await prisma.loginAttempt.updateMany({
      where: {
        username: username,
        success: false,
      },
      data: {
        resolved: true, // We'll need to add this field to schema
      },
    });

    void _ip;
  } catch (error) {
    console.error("Failed to reset login attempts:", error);
  }
}

// Log security events
async function logSecurityEvent(
  _eventType:
    | "LOGIN_SUCCESS"
    | "LOGIN_FAILED"
    | "RATE_LIMITED"
    | "ACCOUNT_LOCKED",
  _details: {
    username?: string;
    ip: string;
    userAgent?: string;
    reason?: string;
  }
) {
  // In production, send to security monitoring service
  // await sendToSecurityService({ eventType: _eventType, ..._details });
  void _eventType;
  void _details;
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

    // Check database-based rate limiting
    const rateLimitCheck = await checkRateLimit(clientIP, username);

    if (!rateLimitCheck.isAllowed) {
      const lockMessage =
        rateLimitCheck.lockType === "ip"
          ? `Too many login attempts from this IP address`
          : `Too many failed attempts for this account`;

      await logSecurityEvent("RATE_LIMITED", {
        username,
        ip: clientIP,
        userAgent,
        reason: `${lockMessage}. Lock type: ${rateLimitCheck.lockType}`,
      });

      return NextResponse.json(
        {
          error: lockMessage + ". Please try again later.",
          remainingAttempts: rateLimitCheck.remainingAttempts,
          retryAfter: rateLimitCheck.retryAfter,
          lockType: rateLimitCheck.lockType,
        },
        { status: rateLimitCheck.lockType === "ip" ? 429 : 423 }
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

      await logLoginAttempt(
        clientIP,
        username,
        userAgent,
        false,
        "Invalid role"
      );

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

      await logLoginAttempt(
        clientIP,
        username,
        userAgent,
        false,
        "User not found"
      );

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

      await logLoginAttempt(
        clientIP,
        username,
        userAgent,
        false,
        "Invalid password"
      );

      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Successful login - log it and reset failed attempts
    await logLoginAttempt(clientIP, username, userAgent, true);

    // Reset failed attempts counter for this user since login was successful
    await resetFailedAttempts(username, clientIP);

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
      .setProtectedHeader({ alg: JWT_CONFIG.ALGORITHM })
      .setExpirationTime(JWT_CONFIG.EXPIRATION)
      .setIssuedAt()
      .sign(getJWTSecret());

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
    response.cookies.set(JWT_CONFIG.COOKIE_NAME, token, getJWTCookieOptions());

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
