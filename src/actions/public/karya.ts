"use server";

import { prisma } from "@/lib/prisma";

export type PublicWork = {
  id: string;
  title: string;
  description: string;
  workType: string;
  mediaUrl: string;
  videoLink: string;
  category: string;
  subject: string;
  createdAt: string;
  studentName: string;
  studentClass: string;
  studentImage: string;
};

type GetPublicWorksParams = {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  type?: string;
};

export async function getPublicWorks({
  page = 1,
  limit = 12,
  category,
  search,
  type,
}: GetPublicWorksParams = {}) {
  try {
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      statusPersetujuan: "APPROVED",
    };

    if (category && category !== "all") {
      where.category = category;
    }

    if (type && type !== "all") {
      where.workType = type.toUpperCase();
    }

    if (search) {
      where.OR = [
        { title: { contains: search } }, // SQLite is case-insensitive by default for LIKE usually, but Prisma depends.
        // Note: In production PostgreSQL, mode: 'insensitive' is needed.
        // Memory says: "Prisma queries... must avoid `mode: 'insensitive'` to ensure compatibility with local SQLite".
        // So I will just use contains.
        { siswa: { name: { contains: search } } },
      ];
    }

    const [works, total] = await prisma.$transaction([
      prisma.studentWork.findMany({
        where,
        include: {
          siswa: {
            select: {
              name: true,
              class: true,
              image: true,
              // If image is stored in `image` field of Siswa
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      prisma.studentWork.count({ where }),
    ]);

    const formattedWorks = works.map((work) => ({
      id: work.id,
      title: work.title,
      description: work.description || "",
      workType: work.workType.toLowerCase(),
      mediaUrl: work.mediaUrl || "",
      videoLink: work.videoLink || "",
      category: work.category || "",
      subject: work.subject || "",
      createdAt: work.createdAt.toISOString(),
      studentName: work.siswa.name || "Siswa",
      studentClass: work.siswa.class || "",
      studentImage: work.siswa.image || "",
    }));

    return {
      success: true,
      data: formattedWorks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("getPublicWorks error:", error);
    return { success: false, error: "Failed to fetch works" };
  }
}

// Get featured works (latest 3 works)
export async function getFeaturedWorks() {
  try {
    const works = await prisma.studentWork.findMany({
      where: {
        statusPersetujuan: "APPROVED",
      },
      include: {
        siswa: {
          select: {
            name: true,
            class: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    const formattedWorks = works.map((work) => ({
      id: work.id,
      title: work.title,
      description: work.description || "",
      workType: work.workType.toLowerCase(),
      mediaUrl: work.mediaUrl || "",
      videoLink: work.videoLink || "",
      category: work.category || "",
      subject: work.subject || "",
      createdAt: work.createdAt.toISOString(),
      studentName: work.siswa.name || "Siswa",
      studentClass: work.siswa.class || "",
      studentImage: work.siswa.image || "",
    }));

    return { success: true, data: formattedWorks };
  } catch (error) {
    console.error("getFeaturedWorks error:", error);
    return { success: false, error: "Failed to fetch featured works" };
  }
}

// Get karya statistics
export async function getKaryaStats() {
  try {
    const [totalWorks, totalPhotos, studentStats, categoryStats] =
      await prisma.$transaction([
        prisma.studentWork.count({
          where: { statusPersetujuan: "APPROVED" },
        }),
        prisma.studentWork.count({
          where: { statusPersetujuan: "APPROVED", workType: "PHOTO" },
        }),
        prisma.studentWork.groupBy({
          by: ["siswaId"],
          where: { statusPersetujuan: "APPROVED" },
          orderBy: { siswaId: "asc" },
        }),
        prisma.studentWork.groupBy({
          by: ["category"],
          where: { statusPersetujuan: "APPROVED" },
          orderBy: { category: "asc" },
          _count: true,
        }),
      ]);

    const categories = categoryStats.map((cat) => ({
      name: cat.category || "Lainnya",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      count: typeof cat._count === 'number' ? cat._count : ((cat._count as any)?._all || 0),
    }));

    return {
      success: true,
      data: {
        totalWorks,
        totalPhotos,
        totalStudents: studentStats.length,
        categories,
      },
    };
  } catch (error) {
    console.error("getKaryaStats error:", error);
    return { success: false, error: "Failed to fetch stats" };
  }
}
