import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { getJWTSecret } from "@/lib/jwt";

export async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token");

  if (!token) return null;

  try {
    const secret = getJWTSecret();
    const { payload } = await jwtVerify(token.value, secret);
    return payload as { userId: string; role: string; username: string };
  } catch (error) {
    console.error("getAuthenticatedUser error:", error);
    return null;
  }
}
