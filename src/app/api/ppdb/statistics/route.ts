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

    // Get overall statistics
    const totalApplications = await prisma.pPDBApplication.count();
    const pendingApplications = await prisma.pPDBApplication.count({
      where: { status: "PENDING" },
    });
    const acceptedApplications = await prisma.pPDBApplication.count({
      where: { status: "ACCEPTED" },
    });
    const rejectedApplications = await prisma.pPDBApplication.count({
      where: { status: "REJECTED" },
    });

    // Get monthly statistics (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await prisma.pPDBApplication.groupBy({
      by: ["status"],
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      _count: {
        id: true,
      },
    });

    // Get recent applications (last 10)
    const recentApplications = await prisma.pPDBApplication.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        name: true,
        nisn: true,
        status: true,
        createdAt: true,
        asalSekolah: true,
      },
    });

    // Get gender distribution
    const genderStats = await prisma.pPDBApplication.groupBy({
      by: ["gender"],
      _count: {
        id: true,
      },
    });

    // Get applications by status per month for chart
    const monthlyApplicationsRaw = await prisma.$queryRaw`
      SELECT
        DATE_TRUNC('month', "createdAt") as month,
        status,
        COUNT(*) as count
      FROM "ppdb_applications"
      WHERE "createdAt" >= ${sixMonthsAgo}
      GROUP BY DATE_TRUNC('month', "createdAt"), status
      ORDER BY month DESC
    `;

    // Convert BigInt to number for JSON serialization
    const monthlyApplications = (
      monthlyApplicationsRaw as Array<{
        month: Date;
        status: string;
        count: bigint;
      }>
    ).map((item) => ({
      ...item,
      count: Number(item.count),
    }));

    const monthlyStatsProcessed = monthlyStats.map(
      (item) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const count = item._count as any;
        return {
          ...item,
          _count: typeof count === 'object' ? count.id : Number(count),
        };
      }
    );

    const genderStatsProcessed = genderStats.map(
      (item) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const count = item._count as any;
        return {
          ...item,
          _count: typeof count === 'object' ? count.id : Number(count),
        };
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          total: totalApplications,
          pending: pendingApplications,
          accepted: acceptedApplications,
          rejected: rejectedApplications,
        },
        monthlyStats: monthlyStatsProcessed,
        recentApplications,
        genderStats: genderStatsProcessed,
        monthlyApplications,
      },
    });
  } catch (error) {
    console.error("Error fetching PPDB statistics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
