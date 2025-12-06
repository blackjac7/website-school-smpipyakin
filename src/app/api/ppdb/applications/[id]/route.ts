import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/utils/security";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
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

    // Check if user is ppdb-officer
    if (payload.role !== "ppdb-officer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const params = await props.params;
    const applicationId = params.id;
    const { status, feedback } = await request.json();

    // Validate status
    if (!["PENDING", "ACCEPTED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Find and update the application
    const application = await prisma.pPDBApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Update the application
    const updatedApplication = await prisma.pPDBApplication.update({
      where: { id: applicationId },
      data: {
        status: status,
        feedback: feedback || null,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        nisn: true,
        status: true,
        feedback: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedApplication,
      message: `Application ${status.toLowerCase()} successfully`,
    });
  } catch (error) {
    console.error("Error updating PPDB application:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
