import { NextRequest, NextResponse } from "next/server";
import {
  verifyJWTWithProtection,
  getClientIPFromRequest,
} from "@/utils/tokenSecurity";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIP = getClientIPFromRequest(request);

    // Verify authentication with brute force protection
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use enhanced JWT verification with token brute force protection
    const { payload, isBlocked, error, remainingAttempts } =
      await verifyJWTWithProtection(token, clientIP);

    if (isBlocked) {
      return NextResponse.json(
        {
          error: error || "Token validation blocked",
          remainingAttempts,
        },
        { status: 429 }
      );
    }

    if (!payload) {
      return NextResponse.json(
        {
          error: error || "Invalid token",
          remainingAttempts,
        },
        { status: 401 }
      );
    }

    // Only allow students to access their own profile
    if (payload.role !== "siswa") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get student profile data
    const student = await prisma.siswa.findUnique({
      where: { userId: payload.userId },
      include: {
        user: {
          select: {
            username: true,
            email: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 }
      );
    }

    // Format response
    const profileData = {
      id: student.id,
      name: student.name || "",
      class: student.class || "",
      year: student.year?.toString() || "",
      nisn: student.nisn || "",
      email: student.email || student.user.email || "",
      phone: student.phone || "",
      address: student.address || "",
      birthDate: student.birthDate?.toISOString().split("T")[0] || "",
      birthPlace: student.birthPlace || "",
      parentName: student.parentName || "",
      parentPhone: student.parentPhone || "",
      profileImage: student.image || "",
      username: student.user.username,
      gender: student.gender,
    };

    return NextResponse.json({
      success: true,
      data: profileData,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIP = getClientIPFromRequest(request);

    // Verify authentication with brute force protection
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use enhanced JWT verification with token brute force protection
    const { payload, isBlocked, error, remainingAttempts } =
      await verifyJWTWithProtection(token, clientIP);

    if (isBlocked) {
      return NextResponse.json(
        {
          error: error || "Token validation blocked",
          remainingAttempts,
        },
        { status: 429 }
      );
    }

    if (!payload) {
      return NextResponse.json(
        {
          error: error || "Invalid token",
          remainingAttempts,
        },
        { status: 401 }
      );
    }

    // Only allow students to update their own profile
    if (payload.role !== "siswa") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      class: classValue,
      year,
      email,
      phone,
      address,
      birthDate,
      birthPlace,
      parentName,
      parentPhone,
      profileImage,
    } = body;

    // Update student profile
    const updatedStudent = await prisma.siswa.update({
      where: { userId: payload.userId },
      data: {
        name,
        class: classValue,
        year: year ? parseInt(year) : null,
        email,
        phone,
        address,
        birthDate: birthDate ? new Date(birthDate) : null,
        birthPlace,
        parentName,
        parentPhone,
        image: profileImage,
      },
      include: {
        user: {
          select: {
            username: true,
            email: true,
          },
        },
      },
    });

    // Format response
    const profileData = {
      id: updatedStudent.id,
      name: updatedStudent.name || "",
      class: updatedStudent.class || "",
      year: updatedStudent.year?.toString() || "",
      nisn: updatedStudent.nisn || "",
      email: updatedStudent.email || updatedStudent.user.email || "",
      phone: updatedStudent.phone || "",
      address: updatedStudent.address || "",
      birthDate: updatedStudent.birthDate?.toISOString().split("T")[0] || "",
      birthPlace: updatedStudent.birthPlace || "",
      parentName: updatedStudent.parentName || "",
      parentPhone: updatedStudent.parentPhone || "",
      profileImage: updatedStudent.image || "",
      username: updatedStudent.user.username,
      gender: updatedStudent.gender,
    };

    return NextResponse.json({
      success: true,
      data: profileData,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
