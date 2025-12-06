import { NextResponse } from "next/server";

/**
 * API Route Handler for user logout.
 * Handles POST requests to log users out.
 * Clears the auth-token cookie.
 *
 * @returns {Promise<NextResponse>} JSON response indicating success or failure.
 */
export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Logout successful",
    });

    // Clear the auth token cookie
    response.cookies.set("auth-token", "", {
      httpOnly: true,
      secure: false, // false for development
      sameSite: "lax", // lax for development
      maxAge: 0, // immediately expire
      path: "/",
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
