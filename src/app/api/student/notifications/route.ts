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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const offset = (page - 1) * limit;

    // Get notifications for the user
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
        time: formatRelativeTime(notification.createdAt),
      })
    );

    return NextResponse.json({
      success: true,
      data: formattedNotifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
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

    const body = await request.json();
    const { notificationId, markAllAsRead } = body;

    if (markAllAsRead) {
      // Mark all notifications as read for the user
      await prisma.notification.updateMany({
        where: {
          userId: payload.userId,
          read: false,
        },
        data: {
          read: true,
        },
      });
    } else if (notificationId) {
      // Mark specific notification as read
      await prisma.notification.update({
        where: {
          id: notificationId,
          userId: payload.userId, // Ensure user can only update their own notifications
        },
        data: {
          read: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Notification(s) marked as read",
    });
  } catch (error) {
    console.error("Update notification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) {
    return "Baru saja";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} menit yang lalu`;
  } else if (diffInMinutes < 1440) {
    // 24 hours
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} jam yang lalu`;
  } else if (diffInMinutes < 10080) {
    // 7 days
    const days = Math.floor(diffInMinutes / 1440);
    return `${days} hari yang lalu`;
  } else {
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
}
