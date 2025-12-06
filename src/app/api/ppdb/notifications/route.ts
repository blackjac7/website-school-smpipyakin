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

    // Check if user is ppdb-officer
    if (payload.role !== "ppdb-officer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const offset = (page - 1) * limit;

    // Get notifications for PPDB officer
    const whereClause = {
      userId: payload.userId,
      ...(unreadOnly && { read: false }),
    };

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    // Get total count for pagination
    const totalCount = await prisma.notification.count({
      where: whereClause,
    });

    // Format response
    const formattedNotifications = notifications.map(
      (notification) => ({
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        read: notification.read,
        createdAt: notification.createdAt.toISOString(),
      })
    );

    return NextResponse.json({
      success: true,
      data: formattedNotifications,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching PPDB notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
