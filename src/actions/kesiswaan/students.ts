"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { isKesiswaanRole } from "@/lib/roles";
import { Prisma, GenderType } from "@prisma/client";

// Validation schemas
const GetStudentsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  classFilter: z.string().optional(),
  genderFilter: z.enum(["all", "MALE", "FEMALE"]).optional(),
});

export type StudentData = {
  id: string;
  name: string;
  nisn: string;
  email: string | null;
  class: string | null;
  gender: string | null;
  birthPlace: string | null;
  birthDate: string | null;
  address: string | null;
  phone: string | null;
  parentName: string | null;
  parentPhone: string | null;
  year: number | null;
  createdAt: string;
  achievementCount: number;
  workCount: number;
};

export type StudentsResult = {
  success: boolean;
  data: StudentData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
};

// Helper to verify kesiswaan role
async function verifyKesiswaanRole() {
  const user = await getAuthenticatedUser();
  if (!user || !isKesiswaanRole(user.role)) {
    return {
      authorized: false,
      error: "Unauthorized: Kesiswaan access required",
    };
  }
  return { authorized: true, user };
}

/**
 * Get paginated students for kesiswaan dashboard
 */
export async function getStudentsForKesiswaan(
  params: z.infer<typeof GetStudentsSchema> = { page: 1, limit: 10 }
): Promise<StudentsResult> {
  try {
    const auth = await verifyKesiswaanRole();
    if (!auth.authorized) {
      return {
        success: false,
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        error: auth.error,
      };
    }

    const validation = GetStudentsSchema.safeParse(params);
    if (!validation.success) {
      return {
        success: false,
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        error: validation.error.issues[0].message,
      };
    }

    const { page, limit, search, classFilter, genderFilter } = validation.data;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.SiswaWhereInput = {};
    const conditions: Prisma.SiswaWhereInput[] = [];

    if (search) {
      conditions.push({
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { nisn: { contains: search } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    if (classFilter && classFilter !== "all") {
      conditions.push({ class: classFilter });
    }

    if (genderFilter && genderFilter !== "all") {
      conditions.push({ gender: genderFilter as GenderType });
    }

    if (conditions.length > 0) {
      where.AND = conditions;
    }

    // Get total count and students in parallel
    const [total, students] = await Promise.all([
      prisma.siswa.count({ where }),
      prisma.siswa.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ class: "asc" }, { name: "asc" }],
        include: {
          _count: {
            select: {
              achievements: true,
              works: true,
            },
          },
        },
      }),
    ]);

    const formattedStudents: StudentData[] = students.map((student) => ({
      id: student.id,
      name: student.name || "",
      nisn: student.nisn || "",
      email: student.email,
      class: student.class,
      gender: student.gender,
      birthPlace: student.birthPlace,
      birthDate: student.birthDate
        ? student.birthDate.toISOString().split("T")[0]
        : null,
      address: student.address,
      phone: student.phone,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      year: student.year,
      createdAt: student.createdAt.toISOString(),
      achievementCount: student._count.achievements,
      workCount: student._count.works,
    }));

    return {
      success: true,
      data: formattedStudents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("getStudentsForKesiswaan error:", error);
    return {
      success: false,
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      error: "Failed to fetch students",
    };
  }
}

/**
 * Get all students for export (no pagination)
 */
export async function getAllStudentsForExport(params?: {
  classFilter?: string;
  genderFilter?: string;
}): Promise<{
  success: boolean;
  data: StudentData[];
  error?: string;
}> {
  try {
    const auth = await verifyKesiswaanRole();
    if (!auth.authorized) {
      return { success: false, data: [], error: auth.error };
    }

    const where: Prisma.SiswaWhereInput = {};
    const conditions: Prisma.SiswaWhereInput[] = [];

    if (params?.classFilter && params.classFilter !== "all") {
      conditions.push({ class: params.classFilter });
    }

    if (params?.genderFilter && params.genderFilter !== "all") {
      conditions.push({ gender: params.genderFilter as GenderType });
    }

    if (conditions.length > 0) {
      where.AND = conditions;
    }

    const students = await prisma.siswa.findMany({
      where,
      orderBy: [{ class: "asc" }, { name: "asc" }],
      include: {
        _count: {
          select: {
            achievements: true,
            works: true,
          },
        },
      },
    });

    const formattedStudents: StudentData[] = students.map((student) => ({
      id: student.id,
      name: student.name || "",
      nisn: student.nisn || "",
      email: student.email,
      class: student.class,
      gender: student.gender,
      birthPlace: student.birthPlace,
      birthDate: student.birthDate
        ? student.birthDate.toISOString().split("T")[0]
        : null,
      address: student.address,
      phone: student.phone,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      year: student.year,
      createdAt: student.createdAt.toISOString(),
      achievementCount: student._count.achievements,
      workCount: student._count.works,
    }));

    return { success: true, data: formattedStudents };
  } catch (error) {
    console.error("getAllStudentsForExport error:", error);
    return { success: false, data: [], error: "Failed to fetch students" };
  }
}

/**
 * Get available classes for filter dropdown
 */
export async function getAvailableClasses(): Promise<string[]> {
  try {
    const auth = await verifyKesiswaanRole();
    if (!auth.authorized) {
      return [];
    }

    const classes = await prisma.siswa.findMany({
      where: { class: { not: null } },
      select: { class: true },
      distinct: ["class"],
      orderBy: { class: "asc" },
    });

    return classes.map((c) => c.class).filter((c): c is string => c !== null);
  } catch (error) {
    console.error("getAvailableClasses error:", error);
    return [];
  }
}

/**
 * Get student statistics for kesiswaan
 */
export async function getStudentStats(): Promise<{
  totalStudents: number;
  maleCount: number;
  femaleCount: number;
  byClass: Array<{ class: string; count: number }>;
}> {
  try {
    const auth = await verifyKesiswaanRole();
    if (!auth.authorized) {
      return { totalStudents: 0, maleCount: 0, femaleCount: 0, byClass: [] };
    }

    const [totalStudents, maleCount, femaleCount, classCounts] =
      await Promise.all([
        prisma.siswa.count(),
        prisma.siswa.count({ where: { gender: "MALE" } }),
        prisma.siswa.count({ where: { gender: "FEMALE" } }),
        prisma.siswa.groupBy({
          by: ["class"],
          _count: { id: true },
          orderBy: { class: "asc" },
        }),
      ]);

    const byClass = classCounts
      .filter((c) => c.class !== null)
      .map((c) => ({
        class: c.class as string,
        count: c._count.id,
      }));

    return { totalStudents, maleCount, femaleCount, byClass };
  } catch (error) {
    console.error("getStudentStats error:", error);
    return { totalStudents: 0, maleCount: 0, femaleCount: 0, byClass: [] };
  }
}
