"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { getJWTSecret, getJWTCookieOptions, JWT_CONFIG } from "@/lib/jwt";

// Define schema for validation
const LoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["admin", "kesiswaan", "siswa", "osis", "ppdb-officer"]),
  honeypot: z.string().max(0, "Spam detected"), // Must be empty
  // Note: Captcha validation is client-side for UX in this implementation.
  // For strict server-side captcha, we would need to store the expected hash in a session/cookie
  // which adds significant complexity. Since we have rate limiting, this is acceptable.
});

// Role mapping
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ROLE_MAPPING = {
  ADMIN: "admin",
  KESISWAAN: "kesiswaan",
  SISWA: "siswa",
  OSIS: "osis",
  PPDB_STAFF: "ppdb-officer",
} as const;

// Reverse mapping for DB lookup
const REVERSE_ROLE_MAPPING: Record<string, keyof typeof ROLE_MAPPING> = {
  admin: "ADMIN",
  kesiswaan: "KESISWAAN",
  siswa: "SISWA",
  osis: "OSIS",
  "ppdb-officer": "PPDB_STAFF",
};

// Permission mapping
const ROLE_PERMISSIONS = {
  ADMIN: ["read", "write", "delete", "manage_users", "view_reports"],
  KESISWAAN: ["read", "write", "manage_students", "view_reports"],
  SISWA: ["read", "view_profile", "submit_assignments"],
  OSIS: ["read", "write", "manage_events", "view_reports"],
  PPDB_STAFF: ["read", "write", "manage_ppdb", "view_applications"],
} as const;

// Helper to get IP address in Server Action
async function getClientIP(): Promise<string> {
  const headersList = await headers();
  const forwarded = headersList.get("x-forwarded-for");
  const real = headersList.get("x-real-ip");

  if (forwarded) return forwarded.split(",")[0].trim();
  if (real) return real;

  return "unknown";
}

// Security logging
async function logSecurityEvent(
  eventType: string,
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
  } catch (error) {
    console.error("Failed to log security event:", error);
  }
}

// Main Login Action
export async function loginAction(prevState: unknown, formData: FormData) {
  const rawData = {
    username: formData.get("username"),
    password: formData.get("password"),
    role: formData.get("role"),
    honeypot: formData.get("honeypot") || "", // Default to empty string if missing
  };

  const clientIP = await getClientIP();
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "unknown";

  // 1. Validate Input using Zod (Includes Honeypot check)
  const validationResult = LoginSchema.safeParse(rawData);

  if (!validationResult.success) {
    // If honeypot failed, log it as a bot attempt
    const honeypotError = validationResult.error.issues.find((e) =>
      e.path.includes("honeypot")
    );
    if (honeypotError) {
      await logSecurityEvent("BOT_DETECTED", {
        ip: clientIP,
        userAgent,
        reason: "Honeypot filled",
      });
      return { success: false, error: "Security check failed" };
    }

    return {
      success: false,
      error: validationResult.error.issues[0].message,
    };
  }

  const { username, password, role } = validationResult.data;

  try {
    // 2. Rate Limiting Check
    // Reuse the logic: 5 attempts per IP per 15 mins
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    const ipAttempts = await prisma.loginAttempt.count({
      where: {
        ip: clientIP,
        success: false,
        resolved: false,
        createdAt: { gte: fifteenMinutesAgo },
      },
    });

    if (ipAttempts >= 5) {
      await logSecurityEvent("RATE_LIMITED", {
        ip: clientIP,
        username,
        reason: "IP rate limit exceeded",
      });
      return {
        success: false,
        error: "Too many login attempts. Please try again in 15 minutes.",
      };
    }

    // 3. Database Lookup
    const dbRole = REVERSE_ROLE_MAPPING[role];
    if (!dbRole) {
      return { success: false, error: "Invalid role" };
    }

    // Special logic for OSIS login:
    // Allow if user is explicitly OSIS OR (user is SISWA AND has osisAccess)
    let user;

    if (role === "osis") {
      user = await prisma.user.findFirst({
        where: {
          username: username,
          OR: [
            { role: "OSIS" },
            {
              role: "SISWA",
              siswa: {
                osisAccess: true,
              },
            },
          ],
        },
        include: {
          siswa: true,
          kesiswaan: true,
        },
      });
    } else {
      // Standard login for other roles
      user = await prisma.user.findFirst({
        where: {
          username: username,
          role: dbRole,
        },
        include: {
          siswa: true,
          kesiswaan: true,
        },
      });
    }

    if (!user) {
      // Log failed attempt
      await prisma.loginAttempt.create({
        data: {
          ip: clientIP,
          username,
          userAgent: userAgent.substring(0, 500),
          success: false,
          failureReason: "User not found",
          createdAt: new Date(),
        },
      });
      return { success: false, error: "Invalid credentials" };
    }

    // 4. Verify Password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      await prisma.loginAttempt.create({
        data: {
          ip: clientIP,
          username,
          userAgent: userAgent.substring(0, 500),
          success: false,
          failureReason: "Invalid password",
          createdAt: new Date(),
        },
      });
      return { success: false, error: "Invalid credentials" };
    }

    // 5. Successful Login
    // Reset failed attempts
    await prisma.loginAttempt.updateMany({
      where: { username: username, success: false },
      data: { resolved: true },
    });

    // Log success
    await prisma.loginAttempt.create({
      data: {
        ip: clientIP,
        username,
        userAgent: userAgent.substring(0, 500),
        success: true,
        createdAt: new Date(),
      },
    });

    // 6. Generate JWT
    const permissions =
      ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS];

    const token = await new SignJWT({
      userId: user.id,
      username: user.username,
      role: role, // Use the input role (frontend friendly format)
      permissions: permissions,
      iat: Math.floor(Date.now() / 1000),
      ip: clientIP,
    })
      .setProtectedHeader({ alg: JWT_CONFIG.ALGORITHM })
      .setExpirationTime(JWT_CONFIG.EXPIRATION)
      .setIssuedAt()
      .sign(getJWTSecret());

    // 7. Set Cookie
    const cookieStore = await cookies();
    cookieStore.set(JWT_CONFIG.COOKIE_NAME, token, getJWTCookieOptions());

    // Return user data for UI updates (no password)
    return {
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        role: role,
        name: user.siswa?.name || user.kesiswaan?.name || user.username,
        permissions: Array.from(permissions),
      },
    };
  } catch (error) {
    console.error("Login action error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

export async function logoutAction() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("auth-token");
    return { success: true, message: "Logged out successfully" };
  } catch (error) {
    console.error("Logout error:", error);
    return { success: false, error: "Failed to logout" };
  }
}
