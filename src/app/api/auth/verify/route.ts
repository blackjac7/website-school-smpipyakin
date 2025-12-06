import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-super-secret-key-change-this-in-production"
);

/**
 * API Route Handler for verifying user authentication tokens.
 * Handles GET requests to check if a valid session exists.
 * Verifies the JWT token from the `auth-token` cookie.
 *
 * @returns {Promise<NextResponse>} JSON response containing user data if valid, or error if invalid/missing token.
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No token found" }, { status: 401 });
    }

    // Verify token
    const { payload: decoded } = await jwtVerify(token, JWT_SECRET);

    // In production, you might want to fetch fresh user data from database
    return NextResponse.json({
      success: true,
      user: {
        id: decoded.userId,
        username: decoded.username,
        role: decoded.role,
        permissions: decoded.permissions,
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
