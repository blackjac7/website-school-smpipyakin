import { NextRequest, NextResponse } from "next/server";
import {
  verifyJWTWithProtection,
  getClientIPFromRequest,
  tokenBruteForceProtection,
} from "@/utils/tokenSecurity";

export async function GET(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIP = getClientIPFromRequest(request);

    // Verify authentication with brute force protection
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use enhanced JWT verification with token brute force protection
    const { payload, isBlocked, error, remainingAttempts } =
      await verifyJWTWithProtection(token, clientIP);

    if (isBlocked) {
      return NextResponse.json(
        {
          error: error || "Token validation blocked",
          remainingAttempts,
        },
        { status: 429 }
      );
    }

    if (!payload) {
      return NextResponse.json(
        {
          error: error || "Invalid token",
          remainingAttempts,
        },
        { status: 401 }
      );
    }

    // Only allow admin to access security statistics
    if (payload.role !== "admin") {
      return NextResponse.json(
        { error: "Access denied - Admin required" },
        { status: 403 }
      );
    }

    // Get global token brute force statistics
    const stats = tokenBruteForceProtection.getGlobalStats();

    // Get current IP statistics
    const ipStats = tokenBruteForceProtection.getIPFailureStats(clientIP);

    return NextResponse.json({
      success: true,
      data: {
        global: stats,
        currentIP: {
          ip: clientIP,
          remainingAttempts:
            tokenBruteForceProtection.getRemainingTokenAttempts(clientIP),
          lockoutTime: tokenBruteForceProtection.getTokenLockoutTime(clientIP),
          failureStats: ipStats,
        },
        security: {
          message: "Token Brute Force Protection is active",
          maxAttemptsPerIP: 10,
          windowMinutes: 15,
          status: "PROTECTED",
        },
      },
    });
  } catch (error) {
    console.error("Security stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
