import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Vercel Cron will hit this endpoint
// We need to verify it's actually Vercel calling
export async function GET(request: Request) {
  // Check authorization header for Vercel Cron
  // Vercel automatically sets this header when running a cron job
  // In development, you might want to allow a manual override or secret key
  const authHeader = request.headers.get("authorization");

  // Note: For strict security, you should configure CRON_SECRET in Vercel
  // and check against `Bearer ${process.env.CRON_SECRET}`
  if (
    process.env.NODE_ENV === "production" &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // Delete logs older than 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const deleted = await prisma.loginAttempt.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo,
        },
      },
    });

    return NextResponse.json({
      success: true,
      deletedCount: deleted.count,
      message: "Old logs cleaned up successfully",
    });
  } catch (error) {
    console.error("[CRON] Cleanup failed:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
