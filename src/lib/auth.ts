import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { getJWTSecret } from "@/lib/jwt";
import { tokenRoleToUserRole } from "@/lib/roles";

type JWTPayload = {
  userId?: string;
  username?: string;
  role?: string;
  permissions?: string[];
  iat?: number;
  exp?: number;
};

export async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token");

  if (!token) return null;

  try {
    const secret = getJWTSecret();
    const { payload } = (await jwtVerify(token.value, secret)) as {
      payload: JWTPayload;
    };

    // Normalize role to Prisma UserRole string where possible to keep server-side checks consistent
    const normalizedRole = tokenRoleToUserRole(payload.role);

    return {
      userId: payload.userId as string,
      username: payload.username as string,
      role: normalizedRole,
    } as { userId: string; role: string | undefined; username: string };
  } catch (error) {
    console.error("getAuthenticatedUser error:", error);
    return null;
  }
}
