import { NextResponse } from "next/server";
import { getJWTCookieOptions, JWT_CONFIG } from "@/lib/jwt";

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Logout successful",
    });

    // Clear the auth token cookie using centralized config
    response.cookies.set(JWT_CONFIG.COOKIE_NAME, "", {
      ...getJWTCookieOptions(),
      maxAge: 0, // immediately expire
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
