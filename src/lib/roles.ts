import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// Map legacy token role strings to Prisma UserRole values
export const TOKEN_TO_USERROLE_MAP: Record<string, UserRole> = {
  admin: UserRole.ADMIN,
  siswa: UserRole.SISWA,
  osis: UserRole.OSIS,
  kesiswaan: UserRole.KESISWAAN,
  ppdb_admin: UserRole.PPDB_ADMIN,
};

export type RoleLike = string | UserRole | undefined | null;

/**
 * Convert any incoming role representation into a normalized UserRole string (uppercase),
 * preferring a mapped Prisma enum value when the input is a legacy token role.
 */
export function tokenRoleToUserRole(role?: RoleLike): string | undefined {
  if (!role) return undefined;
  const r = String(role);
  const mapped = TOKEN_TO_USERROLE_MAP[r.toLowerCase()];
  return mapped ? mapped : r.toUpperCase();
}

/**
 * Normalize arbitrary role input for safe comparisons (lowercase string)
 */
export function normalizeRoleForComparison(
  role?: RoleLike
): string | undefined {
  if (!role) return undefined;
  const mapped = tokenRoleToUserRole(role);
  return mapped ? String(mapped).toLowerCase() : String(role).toLowerCase();
}

/**
 * Check whether a candidate role matches one of the required roles (accepts multiple forms)
 */
export function isRoleMatch(
  candidate?: RoleLike,
  required?: string | string[]
): boolean {
  if (!candidate) return false;

  // Normalize candidate and required roles through the same normalizer so
  // hyphen/underscore and legacy vs enum forms compare consistently.
  const candidateNorm = normalizeRoleForComparison(candidate);
  const req = Array.isArray(required) ? required : required ? [required] : [];

  const normalizedReqs = req.map(
    (r) => normalizeRoleForComparison(r) || String(r).toLowerCase()
  );

  return normalizedReqs.includes(candidateNorm as string);
}

/**
 * Convenience check for admin role
 */
export function isAdminRole(role?: RoleLike): boolean {
  return tokenRoleToUserRole(role) === UserRole.ADMIN;
}

/**
 * Convenience check for siswa (student) role
 */
export function isSiswaRole(role?: RoleLike): boolean {
  return tokenRoleToUserRole(role) === UserRole.SISWA;
}

/**
 * Convenience check for kesiswaan role
 */
export function isKesiswaanRole(role?: RoleLike): boolean {
  return tokenRoleToUserRole(role) === UserRole.KESISWAAN;
}

/**
 * Convenience check for osis role
 */
export function isOsisRole(role?: RoleLike): boolean {
  return tokenRoleToUserRole(role) === UserRole.OSIS;
}

/**
 * Convenience check for ppdb admin role
 */
export function isPpdbAdminRole(role?: RoleLike): boolean {
  return tokenRoleToUserRole(role) === UserRole.PPDB_ADMIN;
}

/**
 * Check if user has OSIS access:
 * - User has role OSIS, OR
 * - User has role SISWA AND has osisAccess=true in siswa table
 * 
 * Also allows admin role for full access.
 */
export async function hasOsisAccess(
  userId: string,
  role?: RoleLike
): Promise<boolean> {
  // Admin always has access
  if (isAdminRole(role)) {
    return true;
  }

  // Check if user has OSIS role directly
  if (isOsisRole(role)) {
    return true;
  }

  // If user is SISWA, check if they have osisAccess flag
  if (isSiswaRole(role)) {
    try {
      const siswa = await prisma.siswa.findUnique({
        where: { userId },
        select: { osisAccess: true },
      });
      return siswa?.osisAccess === true;
    } catch (error) {
      console.error("Error checking OSIS access:", error);
      return false;
    }
  }

  return false;
}

