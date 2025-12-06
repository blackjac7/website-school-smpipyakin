import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

// Mock database - dalam production, gunakan database real
const users = [
  {
    id: "1",
    username: "admin",
    email: "admin@smpipyakin.sch.id",
    password: "$2b$12$wApCNfaJqgf1Z0lLnPVgkODeWCXG7xc18xSuXcQs5E4ONRd3vvLg6", // password: admin123
    role: "admin",
    name: "Administrator",
    permissions: ["read", "write", "delete", "manage_users", "view_reports"],
  },
  {
    id: "2",
    username: "kesiswaan",
    email: "kesiswaan@smpipyakin.sch.id",
    password: "$2b$12$xf58xqHZpPhLlyusu78.zeBvE1QIfZLlBqeRxcoekqFJLXADgsaUm", // password: admin123
    role: "kesiswaan",
    name: "Staff Kesiswaan",
    permissions: ["read", "write", "manage_students", "view_reports"],
  },
  {
    id: "3",
    username: "siswa001",
    email: "siswa001@smpipyakin.sch.id",
    password: "$2b$12$xf58xqHZpPhLlyusu78.zeBvE1QIfZLlBqeRxcoekqFJLXADgsaUm", // password: admin123
    role: "siswa",
    name: "Ahmad Siswa",
    permissions: ["read", "view_profile", "submit_assignments"],
  },
  {
    id: "4",
    username: "osis001",
    email: "osis001@smpipyakin.sch.id",
    password: "$2b$12$xf58xqHZpPhLlyusu78.zeBvE1QIfZLlBqeRxcoekqFJLXADgsaUm", // password: admin123
    role: "osis",
    name: "Ketua OSIS",
    permissions: ["read", "write", "manage_events", "view_reports"],
  },
  {
    id: "5",
    username: "ppdb001",
    email: "ppdb001@smpipyakin.sch.id",
    password: "$2b$12$xf58xqHZpPhLlyusu78.zeBvE1QIfZLlBqeRxcoekqFJLXADgsaUm", // password: admin123
    role: "ppdb-officer",
    name: "Officer PPDB",
    permissions: ["read", "write", "manage_ppdb", "view_applications"],
  },
];

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-super-secret-key-change-this-in-production"
);

/**
 * API Route Handler for user login.
 * Handles POST requests to authenticate users.
 * Validates credentials, creates a JWT token, and sets it in a secure HTTP-only cookie.
 *
 * @param {NextRequest} request - The incoming request object.
 * @returns {Promise<NextResponse>} JSON response indicating success or failure.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, role } = body;

    // Validate input
    if (!username || !password || !role) {
      return NextResponse.json(
        { error: "Username, password, and role are required" },
        { status: 400 }
      );
    }

    // Find user by username and role
    const user = users.find((u) => u.username === username && u.role === role);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials or role" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = await new SignJWT({
      userId: user.id,
      username: user.username,
      role: user.role,
      permissions: user.permissions,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h")
      .setIssuedAt()
      .sign(JWT_SECRET);

    // Return user data (without password)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    const response = NextResponse.json({
      success: true,
      user: userWithoutPassword,
      message: "Login successful",
    });

    // Set secure HTTP-only cookie using response headers
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: false, // false for development
      sameSite: "lax", // lax for development
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
