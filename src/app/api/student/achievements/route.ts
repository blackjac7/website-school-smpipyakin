import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/utils/security";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Only allow students to access their own achievements
    if (payload.role !== "siswa") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get student ID
    const student = await prisma.siswa.findUnique({
      where: { userId: payload.userId },
      select: { id: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Get achievements
    const achievements = await prisma.studentAchievement.findMany({
      where: { siswaId: student.id },
      orderBy: { createdAt: "desc" },
    });

    // Format response
    const formattedAchievements = achievements.map(
      (achievement: {
        id: string;
        title: string;
        description: string | null;
        image: string | null;
        statusPersetujuan: string;
        category: string | null;
        level: string | null;
        achievementDate: Date | null;
        createdAt: Date;
      }) => ({
        id: achievement.id,
        title: achievement.title,
        description: achievement.description || "",
        image: achievement.image || "",
        status: achievement.statusPersetujuan.toLowerCase(),
        category: achievement.category || "",
        level: achievement.level || "",
        date:
          achievement.achievementDate?.toLocaleDateString("id-ID", {
            timeZone: "Asia/Jakarta",
            year: "numeric",
            month: "long",
            day: "numeric",
          }) || "",
        createdAt: achievement.createdAt.toISOString(),
      })
    );

    return NextResponse.json({
      success: true,
      data: formattedAchievements,
    });
  } catch (error) {
    console.error("Get achievements error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Only allow students to create their own achievements
    if (payload.role !== "siswa") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get student ID
    const student = await prisma.siswa.findUnique({
      where: { userId: payload.userId },
      select: { id: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Check pending achievements limit (max 2)
    const pendingAchievements = await prisma.studentAchievement.count({
      where: {
        siswaId: student.id,
        statusPersetujuan: "PENDING",
      },
    });

    if (pendingAchievements >= 2) {
      return NextResponse.json(
        {
          error: "Limit reached",
          message:
            "Anda sudah memiliki 2 prestasi yang sedang menunggu persetujuan. Silakan tunggu hingga ada yang disetujui atau ditolak sebelum mengunggah prestasi baru.",
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, description, category, level, achievementDate, image } =
      body;

    // Validate required fields
    if (!title || !category || !level) {
      return NextResponse.json(
        { error: "Missing required fields: title, category, level" },
        { status: 400 }
      );
    }

    // Create achievement
    const achievement = await prisma.studentAchievement.create({
      data: {
        siswaId: student.id,
        title,
        description,
        category,
        level,
        achievementDate: achievementDate ? new Date(achievementDate) : null,
        image,
        statusPersetujuan: "PENDING", // Default status for new achievements
      },
    });

    // Format response
    const formattedAchievement = {
      id: achievement.id,
      title: achievement.title,
      description: achievement.description || "",
      image: achievement.image || "",
      status: achievement.statusPersetujuan.toLowerCase(),
      category: achievement.category || "",
      level: achievement.level || "",
      date:
        achievement.achievementDate?.toLocaleDateString("id-ID", {
          timeZone: "Asia/Jakarta",
          year: "numeric",
          month: "long",
          day: "numeric",
        }) || "",
      createdAt: achievement.createdAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: formattedAchievement,
      message: "Achievement created successfully",
    });
  } catch (error) {
    console.error("Create achievement error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Only allow students to update their own achievements
    if (payload.role !== "siswa") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const { id, title, description, category, level, achievementDate, image } =
      body;

    if (!id) {
      return NextResponse.json(
        { error: "Achievement ID is required" },
        { status: 400 }
      );
    }

    // Get student ID
    const student = await prisma.siswa.findUnique({
      where: { userId: payload.userId },
      select: { id: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Check if achievement belongs to student
    const existingAchievement = await prisma.studentAchievement.findFirst({
      where: {
        id,
        siswaId: student.id,
      },
    });

    if (!existingAchievement) {
      return NextResponse.json(
        { error: "Achievement not found" },
        { status: 404 }
      );
    }

    // Only allow updates if status is PENDING or REJECTED
    if (existingAchievement.statusPersetujuan === "APPROVED") {
      return NextResponse.json(
        { error: "Cannot modify approved achievements" },
        { status: 400 }
      );
    }

    // Update achievement
    const updatedAchievement = await prisma.studentAchievement.update({
      where: { id },
      data: {
        title,
        description,
        category,
        level,
        achievementDate: achievementDate ? new Date(achievementDate) : null,
        image,
        statusPersetujuan: "PENDING", // Reset to pending after edit
      },
    });

    // Format response
    const formattedAchievement = {
      id: updatedAchievement.id,
      title: updatedAchievement.title,
      description: updatedAchievement.description || "",
      image: updatedAchievement.image || "",
      status: updatedAchievement.statusPersetujuan.toLowerCase(),
      category: updatedAchievement.category || "",
      level: updatedAchievement.level || "",
      date:
        updatedAchievement.achievementDate?.toISOString().split("T")[0] || "",
      createdAt: updatedAchievement.createdAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: formattedAchievement,
      message: "Achievement updated successfully",
    });
  } catch (error) {
    console.error("Update achievement error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
