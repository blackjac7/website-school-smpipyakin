import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { getJWTSecret } from "@/lib/jwt";
import { UserRole } from "@prisma/client";

const ROLE_REVERSE_MAP: Record<string, UserRole | undefined> = {
  admin: UserRole.ADMIN,
  siswa: UserRole.SISWA,
  osis: UserRole.OSIS,
  kesiswaan: UserRole.KESISWAAN,
  "ppdb-officer": UserRole.PPDB_STAFF,
};

export async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token");

  if (!token) return null;

  try {
    const secret = getJWTSecret();
    const { payload } = await jwtVerify(token.value, secret);

    // Normalize role to Prisma UserRole where possible to keep server-side checks consistent
    const rawRole = (payload as any).role as string | undefined;
    const normalizedRole = rawRole ? ROLE_REVERSE_MAP[rawRole] ?? rawRole : rawRole;

    return {
      userId: (payload as any).userId,
      username: (payload as any).username,
      role: normalizedRole,
    } as { userId: string; role: string | UserRole; username: string };
  } catch (error) {
    console.error("getAuthenticatedUser error:", error);
    return null;
  }
}
