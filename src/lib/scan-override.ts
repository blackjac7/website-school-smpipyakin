import { jwtVerify, SignJWT } from "jose";
import { getJWTSecret } from "@/lib/jwt";
import type { ScanMode } from "@/lib/scan-window";

const PURPOSE = "osis-scan-time-override";
const ISSUER = "smp-ip-yakin";
const AUDIENCE = "osis-scanner";
export const SCAN_OVERRIDE_TTL_SECONDS = 10 * 60;

interface OverridePayload {
  osisUserId: string;
  adminUserId: string;
  mode: ScanMode;
}

export async function createScanOverrideToken(payload: OverridePayload) {
  return new SignJWT({
    purpose: PURPOSE,
    osisUserId: payload.osisUserId,
    adminUserId: payload.adminUserId,
    mode: payload.mode,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${SCAN_OVERRIDE_TTL_SECONDS}s`)
    .sign(getJWTSecret());
}

export async function verifyScanOverrideToken(
  token: string | undefined,
  expected: { osisUserId: string; mode: ScanMode },
) {
  if (!token) return false;

  try {
    const { payload } = await jwtVerify(token, getJWTSecret(), {
      issuer: ISSUER,
      audience: AUDIENCE,
    });

    return (
      payload.purpose === PURPOSE &&
      payload.osisUserId === expected.osisUserId &&
      payload.mode === expected.mode &&
      typeof payload.adminUserId === "string"
    );
  } catch {
    return false;
  }
}
