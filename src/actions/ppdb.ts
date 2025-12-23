"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { PPDBStatus, Prisma } from "@prisma/client";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-super-secret-key-change-this-in-production"
);

async function verifyAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

export async function getPPDBStats() {
  const user = await verifyAuth();
  if (!user || user.role !== 'ppdb-officer') {
      // Allow admin too? Assuming PPDB dashboard is restricted.
      // But let's check roles.
      if (!['admin', 'ppdb-officer'].includes(user?.role as string)) {
          return { success: false, error: "Unauthorized" };
      }
  }

  try {
    const total = await prisma.pPDBApplication.count();
    const pending = await prisma.pPDBApplication.count({ where: { status: "PENDING" } });
    const accepted = await prisma.pPDBApplication.count({ where: { status: "ACCEPTED" } });
    const rejected = await prisma.pPDBApplication.count({ where: { status: "REJECTED" } });

    // Recent applications
    const recentApplications = await prisma.pPDBApplication.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        nisn: true,
        status: true,
        createdAt: true,
        asalSekolah: true,
      },
    });

    // Gender stats
    const genderStats = await prisma.pPDBApplication.groupBy({
      by: ["gender"],
      _count: true,
    });

    // Monthly stats processing in JS
    const allApps = await prisma.pPDBApplication.findMany({
        select: { createdAt: true, status: true }
    });

    interface MonthlyStat {
      name: string;
      key: string;
      Total: number;
      Diterima: number;
      Ditolak: number;
      Pending: number;
    }

    // Process monthly stats
    const monthlyStatsMap = allApps.reduce((acc, curr) => {
        const date = new Date(curr.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleString('id-ID', { month: 'long' });

        if (!acc[monthKey]) {
            acc[monthKey] = {
                name: monthName,
                key: monthKey,
                Total: 0,
                Diterima: 0,
                Ditolak: 0,
                Pending: 0
            };
        }

        acc[monthKey].Total++;
        if (curr.status === "PENDING") acc[monthKey].Pending++;
        else if (curr.status === "ACCEPTED") acc[monthKey].Diterima++;
        else if (curr.status === "REJECTED") acc[monthKey].Ditolak++;

        return acc;
    }, {} as Record<string, MonthlyStat>);

    // Sort by key (YYYY-MM) but return array
    const monthlyStats = Object.values(monthlyStatsMap).sort((a, b) => a.key.localeCompare(b.key));

    return {
      success: true,
      data: {
        overview: { total, pending, accepted, rejected },
        recentApplications: recentApplications.map(app => ({
            ...app,
            createdAt: app.createdAt.toISOString()
        })),
        genderStats,
        monthlyStats
      },
    };
  } catch (error) {
    console.error("Error fetching PPDB stats:", error);
    return { success: false, error: "Failed to fetch statistics" };
  }
}

export async function updateApplicantStatus(id: string, status: PPDBStatus, feedback?: string) {
    const user = await verifyAuth();
    if (!user || !['admin', 'ppdb-officer'].includes(user.role as string)) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        await prisma.pPDBApplication.update({
            where: { id },
            data: { status, feedback }
        });
        revalidatePath("/dashboard-ppdb");
        return { success: true };
    } catch (error) {
        console.error("Error updating status:", error);
        return { success: false, error: "Failed to update status" };
    }
}

interface GetApplicantsParams {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
}

export async function getApplicants(params: GetApplicantsParams) {
    const user = await verifyAuth();
    if (!user || !['admin', 'ppdb-officer'].includes(user.role as string)) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const { search, status, page = 1, limit = 10 } = params;
        const skip = (page - 1) * limit;

        const where: Prisma.PPDBApplicationWhereInput = {};

        if (search) {
            where.OR = [
                // Cast to any to bypass type check if mode is not supported in current provider
                // but usually better to omit if not supported.
                // Assuming standard Prisma behavior, contains is supported.
                // If using SQLite, mode: 'insensitive' is not supported.
                { name: { contains: search } },
                { nisn: { contains: search } },
                { asalSekolah: { contains: search } }
            ];
        }

        if (status && status !== 'ALL') {
            where.status = status as PPDBStatus;
        }

        const [data, total] = await Promise.all([
            prisma.pPDBApplication.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.pPDBApplication.count({ where })
        ]);

        return {
            success: true,
            data: {
                data: data.map(app => ({
                    ...app,
                    birthDate: app.birthDate ? app.birthDate.toISOString() : null,
                    createdAt: app.createdAt.toISOString(),
                    updatedAt: app.updatedAt.toISOString(),
                })),
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            }
        };

    } catch (error) {
        console.error("Error fetching applicants:", error);
        return { success: false, error: "Failed to fetch applicants" };
    }
}
