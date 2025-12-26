// Simple in-memory rate limiter for server-side endpoints
// Note: This is per-process and resets on restart. For production, use Redis or a shared store.

type WindowEntry = number[];
const store: Map<string, WindowEntry> = new Map();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

export function isAllowed(
  key: string,
  max = 5,
  windowMs = 60 * 60 * 1000
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;
  const entries = store.get(key) || [];

  // Filter out old timestamps
  const valid = entries.filter((ts) => ts > windowStart);

  if (valid.length >= max) {
    const oldest = Math.min(...valid);
    const retryAfter = oldest + windowMs - now;
    return { allowed: false, remaining: 0, retryAfterMs: retryAfter };
  }

  // Record current attempt
  valid.push(now);
  store.set(key, valid);

  return {
    allowed: true,
    remaining: Math.max(0, max - valid.length),
    retryAfterMs: 0,
  };
}

export function getRemainingAttempts(
  key: string,
  max = 5,
  windowMs = 60 * 60 * 1000
) {
  const now = Date.now();
  const windowStart = now - windowMs;
  const entries = store.get(key) || [];
  const valid = entries.filter((ts) => ts > windowStart);
  return Math.max(0, max - valid.length);
}

export function resetKey(key: string) {
  store.delete(key);
}
