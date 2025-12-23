// Rate limiting utility
export class RateLimiter {
  private submissions: Map<string, number[]> = new Map();
  private maxSubmissions: number;
  private windowMs: number;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(maxSubmissions = 5, windowMs = 3600000) {
    // 1 hour window
    this.maxSubmissions = maxSubmissions;
    this.windowMs = windowMs;

    // Auto-cleanup expired entries every 10 minutes to prevent memory leaks
    this.cleanupInterval = setInterval(
      () => {
        this.cleanup();
      },
      10 * 60 * 1000
    );
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.submissions.forEach((timestamps, key) => {
      const validSubmissions = timestamps.filter(
        (timestamp) => now - timestamp < this.windowMs
      );

      if (validSubmissions.length === 0) {
        keysToDelete.push(key);
      } else {
        this.submissions.set(key, validSubmissions);
      }
    });

    keysToDelete.forEach((key) => this.submissions.delete(key));
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const userSubmissions = this.submissions.get(identifier) || [];

    // Remove old submissions outside the window
    const validSubmissions = userSubmissions.filter(
      (timestamp) => now - timestamp < this.windowMs
    );

    // Check if user has exceeded the limit
    if (validSubmissions.length >= this.maxSubmissions) {
      return false;
    }

    // Add current submission
    validSubmissions.push(now);
    this.submissions.set(identifier, validSubmissions);

    return true;
  }

  getRemainingAttempts(identifier: string): number {
    const now = Date.now();
    const userSubmissions = this.submissions.get(identifier) || [];
    const validSubmissions = userSubmissions.filter(
      (timestamp) => now - timestamp < this.windowMs
    );

    return Math.max(0, this.maxSubmissions - validSubmissions.length);
  }

  getTimeUntilReset(identifier: string): number {
    const userSubmissions = this.submissions.get(identifier) || [];
    if (userSubmissions.length === 0) return 0;

    const oldestSubmission = Math.min(...userSubmissions);
    const resetTime = oldestSubmission + this.windowMs;
    const now = Date.now();

    return Math.max(0, resetTime - now);
  }

  // Manual cleanup method
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.submissions.clear();
  }
}

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove script tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, "") // Remove event handlers
    .substring(0, 1000); // Limit length
};

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

// Phone validation (Indonesian format)
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/;
  return phone === "" || phoneRegex.test(phone.replace(/\s/g, ""));
};

// Honeypot validation
export const createHoneypot = () => {
  return Math.random().toString(36).substring(7);
};

// Get client IP (for rate limiting)
export const getClientIP = (): string => {
  // In production, this would get real IP from headers
  // For development, we'll use a fingerprint based on browser/session
  if (typeof window !== "undefined") {
    const stored = sessionStorage.getItem("client_fingerprint");
    if (stored) return stored;

    const fingerprint = btoa(
      navigator.userAgent +
        navigator.language +
        screen.width +
        screen.height +
        Date.now().toString().substring(0, 10) // Hour-based component
    ).substring(0, 16);

    sessionStorage.setItem("client_fingerprint", fingerprint);
    return fingerprint;
  }
  return "unknown";
};

// JWT verification utility
import { jwtVerify } from "jose";
import { getJWTSecret } from "@/lib/jwt";

export interface JWTPayload {
  userId: string;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

export const verifyJWT = async (token: string): Promise<JWTPayload | null> => {
  try {
    const { payload } = await jwtVerify(token, getJWTSecret());

    // Validate required fields
    if (
      payload &&
      typeof payload === "object" &&
      "userId" in payload &&
      "username" in payload &&
      "role" in payload
    ) {
      return {
        userId: payload.userId as string,
        username: payload.username as string,
        role: payload.role as string,
        iat: payload.iat,
        exp: payload.exp,
      };
    }

    return null;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
};
