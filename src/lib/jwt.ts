/**
 * Centralized JWT Configuration
 * This file provides a single source of truth for JWT secret management
 * to prevent hardcoded fallbacks scattered across the codebase.
 */

/**
 * Get the JWT secret as TextEncoder format for jose library
 * @throws Error if JWT_SECRET is not set in production
 */
export function getJWTSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;

  // In production, NEVER allow missing JWT_SECRET
  if (process.env.NODE_ENV === "production" && !secret) {
    throw new Error(
      "CRITICAL: JWT_SECRET environment variable is not set in production!"
    );
  }

  // In development, allow a fallback but log a warning
  if (!secret) {
    console.warn(
      "⚠️ WARNING: JWT_SECRET not set. Using development fallback. DO NOT use in production!"
    );
    return new TextEncoder().encode("dev-only-secret-do-not-use-in-production");
  }

  // Validate minimum secret length for security
  if (secret.length < 32) {
    console.warn(
      "⚠️ WARNING: JWT_SECRET should be at least 32 characters for security"
    );
  }

  return new TextEncoder().encode(secret);
}

/**
 * JWT Configuration constants
 */
export const JWT_CONFIG = {
  // Token expiration time
  EXPIRATION: "24h",

  // Algorithm
  ALGORITHM: "HS256" as const,

  // Cookie settings
  COOKIE_NAME: "auth-token",
  COOKIE_MAX_AGE: 24 * 60 * 60, // 24 hours in seconds
} as const;

/**
 * Get cookie options for JWT token
 */
export function getJWTCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? ("strict" as const) : ("lax" as const),
    maxAge: JWT_CONFIG.COOKIE_MAX_AGE,
    path: "/",
  };
}
