import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getJWTSecret, JWT_CONFIG } from "@/lib/jwt";
import { tokenRoleToUserRole } from "@/lib/roles";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(JWT_CONFIG.COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ error: "No token found" }, { status: 401 });
    }

    // Verify token
    const { payload: decoded } = await jwtVerify(token, getJWTSecret());

    // Get fresh user data from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId as string },
      include: {
        siswa: true,
        kesiswaan: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    // Get display name
    let displayName = user.username;
    if (user.siswa?.name) {
      displayName = user.siswa.name;
    } else if (user.kesiswaan?.name) {
      displayName = user.kesiswaan.name;
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: displayName,
        role: decoded.role,
        normalizedRole: tokenRoleToUserRole(decoded.role as string),
        email: user.email,
        permissions: decoded.permissions,
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
