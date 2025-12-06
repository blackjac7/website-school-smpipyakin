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

    // Only allow students to access their own works
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

    // Get works
    const works = await prisma.studentWork.findMany({
      where: { siswaId: student.id },
      orderBy: { createdAt: "desc" },
    });

    // Format response
    const formattedWorks = works.map(
      (work: {
        id: string;
        title: string;
        description: string | null;
        workType: string;
        mediaUrl: string | null;
        videoLink: string | null;
        statusPersetujuan: string;
        category: string | null;
        subject: string | null;
        rejectionNote: string | null;
        createdAt: Date;
      }) => ({
        id: work.id,
        title: work.title,
        description: work.description || "",
        workType: work.workType.toLowerCase(),
        mediaUrl: work.mediaUrl || "",
        videoLink: work.videoLink || "",
        status: work.statusPersetujuan.toLowerCase(),
        category: work.category || "",
        subject: work.subject || "",
        rejectionNote: work.rejectionNote || "",
        createdAt: work.createdAt.toISOString(),
      })
    );

    return NextResponse.json({
      success: true,
      data: formattedWorks,
    });
  } catch (error) {
    console.error("Get works error:", error);
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

    // Only allow students to create their own works
    if (payload.role !== "siswa") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      description,
      workType,
      mediaUrl,
      videoLink,
      category,
      subject,
    } = body;

    // Validate required fields
    if (!title || !workType || !category) {
      return NextResponse.json(
        { error: "Missing required fields: title, workType, category" },
        { status: 400 }
      );
    }

    // Validate workType
    if (!["photo", "video"].includes(workType.toLowerCase())) {
      return NextResponse.json(
        { error: "Invalid workType. Must be 'photo' or 'video'" },
        { status: 400 }
      );
    }

    // Validate media based on type
    if (workType.toLowerCase() === "photo" && !mediaUrl) {
      return NextResponse.json(
        { error: "mediaUrl is required for photo works" },
        { status: 400 }
      );
    }

    if (workType.toLowerCase() === "video" && !videoLink) {
      return NextResponse.json(
        { error: "videoLink is required for video works" },
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

    // Check pending works limit (max 2)
    const pendingWorks = await prisma.studentWork.count({
      where: {
        siswaId: student.id,
        statusPersetujuan: "PENDING",
      },
    });

    if (pendingWorks >= 2) {
      return NextResponse.json(
        {
          error: "Limit reached",
          message:
            "Anda sudah memiliki 2 karya yang sedang menunggu persetujuan. Silakan tunggu hingga ada yang disetujui atau ditolak sebelum mengunggah karya baru.",
        },
        { status: 400 }
      );
    }

    // Create work
    const work = await prisma.studentWork.create({
      data: {
        siswaId: student.id,
        title,
        description,
        workType: workType.toUpperCase(),
        mediaUrl: workType.toLowerCase() === "photo" ? mediaUrl : null,
        videoLink: workType.toLowerCase() === "video" ? videoLink : null,
        category,
        subject,
        statusPersetujuan: "PENDING", // Default status for new works
      },
    });

    // Format response
    const formattedWork = {
      id: work.id,
      title: work.title,
      description: work.description || "",
      workType: work.workType.toLowerCase(),
      mediaUrl: work.mediaUrl || "",
      videoLink: work.videoLink || "",
      status: work.statusPersetujuan.toLowerCase(),
      category: work.category || "",
      subject: work.subject || "",
      createdAt: work.createdAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: formattedWork,
      message: "Work created successfully",
    });
  } catch (error) {
    console.error("Create work error:", error);
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

    // Only allow students to update their own works
    if (payload.role !== "siswa") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const {
      id,
      title,
      description,
      workType,
      mediaUrl,
      videoLink,
      category,
      subject,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Work ID is required" },
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

    // Check if work belongs to student
    const existingWork = await prisma.studentWork.findFirst({
      where: {
        id,
        siswaId: student.id,
      },
    });

    if (!existingWork) {
      return NextResponse.json({ error: "Work not found" }, { status: 404 });
    }

    // Only allow updates if status is PENDING or REJECTED
    if (existingWork.statusPersetujuan === "APPROVED") {
      return NextResponse.json(
        { error: "Cannot modify approved works" },
        { status: 400 }
      );
    }

    // Update work
    const updatedWork = await prisma.studentWork.update({
      where: { id },
      data: {
        title,
        description,
        workType: workType?.toUpperCase(),
        mediaUrl: workType?.toLowerCase() === "photo" ? mediaUrl : null,
        videoLink: workType?.toLowerCase() === "video" ? videoLink : null,
        category,
        subject,
        statusPersetujuan: "PENDING", // Reset to pending after edit
      },
    });

    // Format response
    const formattedWork = {
      id: updatedWork.id,
      title: updatedWork.title,
      description: updatedWork.description || "",
      workType: updatedWork.workType.toLowerCase(),
      mediaUrl: updatedWork.mediaUrl || "",
      videoLink: updatedWork.videoLink || "",
      status: updatedWork.statusPersetujuan.toLowerCase(),
      category: updatedWork.category || "",
      subject: updatedWork.subject || "",
      createdAt: updatedWork.createdAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: formattedWork,
      message: "Work updated successfully",
    });
  } catch (error) {
    console.error("Update work error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    // Only allow students to delete their own works
    if (payload.role !== "siswa") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Work ID is required" },
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

    // Check if work belongs to student
    const existingWork = await prisma.studentWork.findFirst({
      where: {
        id,
        siswaId: student.id,
      },
    });

    if (!existingWork) {
      return NextResponse.json({ error: "Work not found" }, { status: 404 });
    }

    // Only allow deletion if status is PENDING or REJECTED
    if (existingWork.statusPersetujuan === "APPROVED") {
      return NextResponse.json(
        { error: "Cannot delete approved works" },
        { status: 400 }
      );
    }

    // Delete work
    await prisma.studentWork.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Work deleted successfully",
    });
  } catch (error) {
    console.error("Delete work error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
