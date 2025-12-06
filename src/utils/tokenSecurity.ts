import { RateLimiter } from "@/utils/security";

// Token brute force protection
export class TokenBruteForceProtection {
  private tokenFailureLimit: RateLimiter;
  private globalTokenFailures: Map<string, number> = new Map();
  private ipTokenFailures: Map<string, { count: number; lastAttempt: number }> =
    new Map();

  constructor() {
    // Rate limiter for token attempts: 10 failed attempts per 15 minutes per IP
    this.tokenFailureLimit = new RateLimiter(10, 900000);

    // Cleanup old entries every 30 minutes
    setInterval(
      () => {
        this.cleanupOldEntries();
      },
      30 * 60 * 1000
    );
  }

  private cleanupOldEntries(): void {
    const now = Date.now();
    const maxAge = 900000; // 15 minutes

    // Cleanup IP failures older than 15 minutes
    for (const [ip, data] of this.ipTokenFailures.entries()) {
      if (now - data.lastAttempt > maxAge) {
        this.ipTokenFailures.delete(ip);
      }
    }
  }

  // Check if IP is allowed to attempt token validation
  public isTokenAttemptAllowed(clientIP: string): boolean {
    return this.tokenFailureLimit.isAllowed(clientIP);
  }

  // Record a failed token attempt
  public recordTokenFailure(clientIP: string, token: string): void {
    // Check rate limiter (this will also record the submission)
    this.tokenFailureLimit.isAllowed(clientIP);

    // Track IP-specific failures
    const ipData = this.ipTokenFailures.get(clientIP) || {
      count: 0,
      lastAttempt: 0,
    };
    ipData.count += 1;
    ipData.lastAttempt = Date.now();
    this.ipTokenFailures.set(clientIP, ipData);

    // Track global token failures (for monitoring)
    const tokenHash = this.hashToken(token);
    this.globalTokenFailures.set(
      tokenHash,
      (this.globalTokenFailures.get(tokenHash) || 0) + 1
    );

    // Log suspicious activity
    if (ipData.count > 5) {
      console.warn(
        `⚠️ Suspicious token brute force from IP: ${clientIP} (${ipData.count} attempts)`
      );
    }
  }

  // Get remaining token attempts for IP
  public getRemainingTokenAttempts(clientIP: string): number {
    return this.tokenFailureLimit.getRemainingAttempts(clientIP);
  }

  // Get time until token attempts are allowed again
  public getTokenLockoutTime(clientIP: string): number {
    return this.tokenFailureLimit.getTimeUntilReset(clientIP);
  }

  // Check if a specific token is being brute forced
  public isTokenUnderAttack(token: string): boolean {
    const tokenHash = this.hashToken(token);
    const attempts = this.globalTokenFailures.get(tokenHash) || 0;
    return attempts > 50; // If same token tried 50+ times
  }

  // Get IP failure statistics
  public getIPFailureStats(
    clientIP: string
  ): { count: number; lastAttempt: number } | null {
    return this.ipTokenFailures.get(clientIP) || null;
  }

  // Hash token for tracking (to avoid storing actual tokens)
  private hashToken(token: string): string {
    // Simple hash for tracking without storing actual tokens
    let hash = 0;
    for (let i = 0; i < Math.min(token.length, 20); i++) {
      const char = token.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  // Get global statistics (for admin monitoring)
  public getGlobalStats(): {
    totalFailedTokens: number;
    uniqueFailedTokens: number;
    activeAttackingIPs: number;
  } {
    let totalFailures = 0;
    for (const count of this.globalTokenFailures.values()) {
      totalFailures += count;
    }

    const activeIPs = Array.from(this.ipTokenFailures.values()).filter(
      (data) => Date.now() - data.lastAttempt < 900000
    ).length;

    return {
      totalFailedTokens: totalFailures,
      uniqueFailedTokens: this.globalTokenFailures.size,
      activeAttackingIPs: activeIPs,
    };
  }
}

// Global instance
export const tokenBruteForceProtection = new TokenBruteForceProtection();

// Enhanced JWT verification with brute force protection
import { verifyJWT as originalVerifyJWT, JWTPayload } from "@/utils/security";
import { NextRequest } from "next/server";

// Helper function to get client IP from NextRequest
export function getClientIPFromRequest(request: NextRequest): string {
  // Try to get IP from various headers
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const cfConnectingIP = request.headers.get("cf-connecting-ip");

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // Fallback to localhost for development
  return "127.0.0.1";
}

export async function verifyJWTWithProtection(
  token: string,
  clientIP: string
): Promise<{
  payload: JWTPayload | null;
  isBlocked: boolean;
  error?: string;
  remainingAttempts?: number;
}> {
  // Check if IP is rate limited for token attempts
  if (!tokenBruteForceProtection.isTokenAttemptAllowed(clientIP)) {
    const remaining =
      tokenBruteForceProtection.getRemainingTokenAttempts(clientIP);
    const lockoutTime = Math.ceil(
      tokenBruteForceProtection.getTokenLockoutTime(clientIP) / 60000
    );

    return {
      payload: null,
      isBlocked: true,
      error: `Too many invalid token attempts. Try again in ${lockoutTime} minutes.`,
      remainingAttempts: remaining,
    };
  }

  // Check if this specific token is under attack
  if (tokenBruteForceProtection.isTokenUnderAttack(token)) {
    return {
      payload: null,
      isBlocked: true,
      error: "Token validation temporarily blocked due to suspicious activity.",
    };
  }

  // Attempt to verify the token
  const payload = await originalVerifyJWT(token);

  // If verification failed, record the failure
  if (!payload) {
    tokenBruteForceProtection.recordTokenFailure(clientIP, token);

    const remaining =
      tokenBruteForceProtection.getRemainingTokenAttempts(clientIP);

    return {
      payload: null,
      isBlocked: false,
      error: "Invalid token",
      remainingAttempts: remaining,
    };
  }

  // Success - token is valid
  return {
    payload,
    isBlocked: false,
  };
}
