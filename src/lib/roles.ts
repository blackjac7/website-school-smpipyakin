import { UserRole } from "@prisma/client";

// Map legacy token role strings to Prisma UserRole values
export const TOKEN_TO_USERROLE_MAP: Record<string, UserRole> = {
  admin: UserRole.ADMIN,
  siswa: UserRole.SISWA,
  osis: UserRole.OSIS,
  kesiswaan: UserRole.KESISWAAN,
  "ppdb-officer": UserRole.PPDB_STAFF,
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
export function normalizeRoleForComparison(role?: RoleLike): string | undefined {
  if (!role) return undefined;
  const mapped = tokenRoleToUserRole(role);
  return mapped ? String(mapped).toLowerCase() : String(role).toLowerCase();
}

/**
 * Check whether a candidate role matches one of the required roles (accepts multiple forms)
 */
export function isRoleMatch(candidate?: RoleLike, required?: string | string[]): boolean {
  if (!candidate) return false;
  const candidateNorm = normalizeRoleForComparison(candidate);
  const req = Array.isArray(required) ? required : required ? [required] : [];
  return req.map((r) => String(r).toLowerCase()).includes(candidateNorm as string);
}

/**
 * Convenience check for admin role
 */
export function isAdminRole(role?: RoleLike): boolean {
  return tokenRoleToUserRole(role) === UserRole.ADMIN;
}
