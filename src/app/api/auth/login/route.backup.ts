import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-super-secret-key-change-this-in-production"
);

// Role mapping untuk kompatibilitas dengan auth system lama
const ROLE_MAPPING = {
  ADMIN: "admin",
  KESISWAAN: "kesiswaan",
  SISWA: "siswa",
  OSIS: "osis",
  PPDB_STAFF: "ppdb-officer",
} as const;

// Permission mapping berdasarkan role
const ROLE_PERMISSIONS = {
  ADMIN: ["read", "write", "delete", "manage_users", "view_reports"],
  KESISWAAN: ["read", "write", "manage_students", "view_reports"],
  SISWA: ["read", "view_profile", "submit_assignments"],
  OSIS: ["read", "write", "manage_events", "view_reports"],
  PPDB_STAFF: ["read", "write", "manage_ppdb", "view_applications"],
} as const;

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

    // Convert role ke format database (misal: admin -> ADMIN)
    const dbRole = Object.keys(ROLE_MAPPING).find(
      (key) => ROLE_MAPPING[key as keyof typeof ROLE_MAPPING] === role
    ) as keyof typeof ROLE_MAPPING;

    if (!dbRole) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Find user by username and role in database
    const user = await prisma.user.findFirst({
      where: {
        username: username,
        role: dbRole,
      },
      include: {
        siswa: true,
        kesiswaan: true,
      },
    });

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

    // Get user display name
    let displayName = user.username;
    if (user.siswa?.name) {
      displayName = user.siswa.name;
    } else if (user.kesiswaan?.name) {
      displayName = user.kesiswaan.name;
    }

    // Get permissions for role
    const permissions =
      ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS];

    // Create JWT token
    const token = await new SignJWT({
      userId: user.id,
      username: user.username,
      role: ROLE_MAPPING[user.role as keyof typeof ROLE_MAPPING], // Convert back to old format for compatibility
      permissions: permissions,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h")
      .setIssuedAt()
      .sign(JWT_SECRET);

    // Return user data (without password)
    const userResponse = {
      id: user.id,
      username: user.username,
      name: displayName,
      role: ROLE_MAPPING[user.role as keyof typeof ROLE_MAPPING],
      email: user.email,
      permissions: permissions,
    };

    const response = NextResponse.json({
      success: true,
      user: userResponse,
      message: "Login successful",
    });

    // Set secure HTTP-only cookie
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
