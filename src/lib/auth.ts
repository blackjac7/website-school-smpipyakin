import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token");

  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-super-secret-key-change-this-in-production");
    const { payload } = await jwtVerify(token.value, secret);
    return payload as { userId: string; role: string; username: string };
  } catch (error) {
    return null;
  }
}
