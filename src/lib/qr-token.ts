import { createHmac } from "crypto";

/**
 * QR Token Utility for Student Lateness Tracking
 * 
 * ===== BEST PRACTICES IMPLEMENTED =====
 * 
 * 1. SECURITY:
 *    - HMAC-SHA256 with server secret (unforgeable without key)
 *    - Timing-safe comparison (prevents timing attacks)
 *    - Token is permanent (no expiry, simplifies school use)
 * 
 * 2. QR SIZE OPTIMIZATION:
 *    - Base64URL encoding (URL-safe, 33% smaller than hex)
 *    - Compact payload format (minimal JSON keys)
 *    - 16-char token (64-bit entropy, sufficient for school use)
 * 
 * 3. ERROR CORRECTION:
 *    - Level M (15%) - good balance for printed cards
 *    - Can survive moderate damage/wear on student ID cards
 * 
 * 4. COMPATIBILITY:
 *    - Version field for future upgrades
 *    - Backward compatible parsing
 * 
 * QR Payload: Base64URL({"i":"siswaId","t":"16charToken","v":2})
 * Total: ~60 characters (compact QR code)
 */

const QR_SECRET = process.env.JWT_SECRET || "dev-qr-secret";
const QR_VERSION = 2; // Bumped version for Base64URL format

/**
 * Convert Buffer to Base64URL (URL-safe base64)
 */
function toBase64URL(buffer: Buffer): string {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Convert Base64URL to Buffer
 */
function fromBase64URL(str: string): Buffer {
  // Add back padding if needed
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64");
}

/**
 * Generate a secure, permanent QR token for a student
 * Uses first 16 chars of HMAC-SHA256 = 64 bits of entropy
 * Sufficient for ~1000 students without collision risk
 */
export function generateQRToken(siswaId: string): string {
  const hmac = createHmac("sha256", QR_SECRET);
  hmac.update(siswaId);
  return hmac.digest("hex").substring(0, 16); // 16-char hex token
}

/**
 * Verify QR token against siswaId
 * Uses timing-safe comparison to prevent timing attacks
 */
export function verifyQRToken(token: string, siswaId: string): boolean {
  const expectedToken = generateQRToken(siswaId);
  
  // Length check
  if (token.length !== expectedToken.length) return false;

  // Timing-safe comparison
  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ expectedToken.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Generate compact QR code payload (to be encoded in QR)
 * Uses minimal JSON keys for smaller QR codes:
 * - i = id (siswaId)
 * - t = token
 * - v = version
 */
export function generateQRPayload(siswaId: string, token: string): string {
  const payload = {
    i: siswaId,    // compact key
    t: token,
    v: QR_VERSION,
  };
  return toBase64URL(Buffer.from(JSON.stringify(payload)));
}

/**
 * Parse QR code payload (supports both v1 and v2 formats)
 */
export function parseQRPayload(
  qrData: string
): { id: string; token: string } | null {
  try {
    // Try Base64URL first (v2)
    let decoded: string;
    try {
      decoded = fromBase64URL(qrData).toString("utf-8");
    } catch {
      // Fallback to regular Base64 (v1)
      decoded = Buffer.from(qrData, "base64").toString("utf-8");
    }
    
    const payload = JSON.parse(decoded);
    
    // Support both v1 (id, t) and v2 (i, t) formats
    const siswaId = payload.i || payload.id;
    const token = payload.t;
    
    if (!siswaId || !token) return null;
    return { id: siswaId, token };
  } catch {
    return null;
  }
}

/**
 * Validate a scanned QR code
 * Returns siswaId if valid, null if invalid
 */
export function validateQRScan(qrData: string): string | null {
  const parsed = parseQRPayload(qrData);
  if (!parsed) return null;

  const isValid = verifyQRToken(parsed.token, parsed.id);
  return isValid ? parsed.id : null;
}

// ==============================================
// TIME UTILITIES FOR LATENESS DETECTION
// ==============================================

// Late time threshold: 06:30 WIB (Jakarta, UTC+7)
export const LATE_THRESHOLD = {
  hour: 6,
  minute: 30,
  utcOffset: 7, // WIB is UTC+7
};

/**
 * Get current time in WIB timezone
 */
function getWIBTime(): Date {
  const now = new Date();
  // WIB is UTC+7, so add 7 hours to UTC time
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const wib = new Date(utc + 3600000 * LATE_THRESHOLD.utcOffset);
  return wib;
}

/**
 * Check if current time is past the late threshold
 */
export function isCurrentlyLateTime(): boolean {
  const wibTime = getWIBTime();
  const currentHour = wibTime.getHours();
  const currentMinute = wibTime.getMinutes();

  if (currentHour > LATE_THRESHOLD.hour) return true;
  if (
    currentHour === LATE_THRESHOLD.hour &&
    currentMinute > LATE_THRESHOLD.minute
  )
    return true;
  return false;
}

/**
 * Format time to HH:mm string in WIB
 */
export function formatTimeWIB(): string {
  const wibTime = getWIBTime();
  const hours = wibTime.getHours().toString().padStart(2, "0");
  const minutes = wibTime.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}
