"use server";

import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { isRoleMatch } from "@/lib/roles";
import { generateQRToken, generateQRPayload } from "@/lib/qr-token";
import { revalidatePath } from "next/cache";

/**
 * Custom sort function for class names
 * Sort order: VII (7), VIII (8), IX (9), then alphabetically for suffixes (A, B, C...)
 */
function sortClasses(classes: string[]): string[] {
  return classes.sort((a, b) => {
    // Extract grade number (VII=7, VIII=8, IX=9)
    const getGradeOrder = (cls: string): number => {
      if (cls.startsWith("VII") || cls.startsWith("7")) return 7;
      if (cls.startsWith("VIII") || cls.startsWith("8")) return 8;
      if (cls.startsWith("IX") || cls.startsWith("9")) return 9;
      return 10; // Unknown grades go last
    };
    
    const gradeA = getGradeOrder(a);
    const gradeB = getGradeOrder(b);
    
    if (gradeA !== gradeB) {
      return gradeA - gradeB;
    }
    
    // Same grade, sort alphabetically (VII-A before VII-B)
    return a.localeCompare(b);
  });
}

/**
 * Get all students with their QR codes for Kesiswaan bulk print
 * Supports search across ALL students (not just current page)
 */
export async function getAllStudentQRCodes(
  classFilter?: string,
  page: number = 1,
  limit: number = 50,
  searchTerm?: string
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Only Kesiswaan and Admin can access bulk QR codes
  if (!isRoleMatch(user.role, ["kesiswaan", "admin"])) {
    return { success: false, error: "Akses Kesiswaan diperlukan" };
  }

  try {
    const skip = (page - 1) * limit;

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    
    if (classFilter && classFilter !== "all") {
      where.class = classFilter;
    }
    
    // Search by name or NISN (across ALL students)
    if (searchTerm && searchTerm.trim()) {
      where.OR = [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { nisn: { contains: searchTerm } },
      ];
    }

    const [students, totalCount] = await Promise.all([
      prisma.siswa.findMany({
        where,
        select: {
          id: true,
          name: true,
          nisn: true,
          class: true,
          qrToken: true,
          image: true,
        },
        orderBy: [
          { class: "asc" },
          { name: "asc" },
        ],
        skip,
        take: limit,
      }),
      prisma.siswa.count({ where }),
    ]);

    // Generate QR codes for students who don't have one yet
    const studentsWithQR = await Promise.all(
      students.map(async (student) => {
        let token = student.qrToken;
        
        // Generate token if not exists
        if (!token) {
          token = generateQRToken(student.id);
          await prisma.siswa.update({
            where: { id: student.id },
            data: { qrToken: token },
          });
        }

        const qrPayload = generateQRPayload(student.id, token);

        return {
          id: student.id,
          name: student.name,
          nisn: student.nisn,
          class: student.class,
          image: student.image,
          qrData: qrPayload,
        };
      })
    );

    // Custom sort by class (VII, VIII, IX)
    studentsWithQR.sort((a, b) => {
      const getGradeOrder = (cls: string | null): number => {
        if (!cls) return 99;
        if (cls.startsWith("VII") || cls.startsWith("7")) return 7;
        if (cls.startsWith("VIII") || cls.startsWith("8")) return 8;
        if (cls.startsWith("IX") || cls.startsWith("9")) return 9;
        return 10;
      };
      
      const gradeA = getGradeOrder(a.class);
      const gradeB = getGradeOrder(b.class);
      
      if (gradeA !== gradeB) return gradeA - gradeB;
      
      // Same grade, sort by class name then by student name
      const classCompare = (a.class || "").localeCompare(b.class || "");
      if (classCompare !== 0) return classCompare;
      
      return (a.name || "").localeCompare(b.name || "");
    });

    return {
      success: true,
      students: studentsWithQR,
      pagination: {
        page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit,
      },
    };
  } catch (error) {
    console.error("Error getting student QR codes:", error);
    return { success: false, error: "Gagal mengambil data QR siswa" };
  }
}

/**
 * Get all unique classes for filter dropdown (sorted properly)
 */  
export async function getClassesForQR() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { success: false, error: "Unauthorized", classes: [] };
  }

  if (!isRoleMatch(user.role, ["kesiswaan", "admin"])) {
    return { success: false, error: "Akses Kesiswaan diperlukan", classes: [] };
  }

  try {
    const classes = await prisma.siswa.findMany({
      where: { class: { not: null } },
      select: { class: true },
      distinct: ["class"],
    });

    // Get unique class names and sort them properly
    const classNames = classes.map((c) => c.class).filter(Boolean) as string[];
    const sortedClasses = sortClasses(classNames);

    return {
      success: true,
      classes: sortedClasses,
    };
  } catch (error) {
    console.error("Error getting classes:", error);
    return { success: false, error: "Gagal mengambil daftar kelas", classes: [] };
  }
}

/**
 * Regenerate QR tokens for all students
 * This will invalidate all existing QR codes
 */
export async function regenerateAllQRTokens() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Only Admin can regenerate all QR tokens
  if (!isRoleMatch(user.role, ["admin", "kesiswaan"])) {
    return { success: false, error: "Akses Admin/Kesiswaan diperlukan" };
  }

  try {
    // Get all students
    const students = await prisma.siswa.findMany({
      select: { id: true },
    });

    // Regenerate tokens for all students
    let regeneratedCount = 0;
    for (const student of students) {
      const newToken = generateQRToken(student.id);
      await prisma.siswa.update({
        where: { id: student.id },
        data: { qrToken: newToken },
      });
      regeneratedCount++;
    }

    // Revalidate paths
    revalidatePath("/dashboard-kesiswaan");
    revalidatePath("/dashboard-siswa");

    return {
      success: true,
      message: `Berhasil regenerate ${regeneratedCount} QR Code siswa`,
      count: regeneratedCount,
    };
  } catch (error) {
    console.error("Error regenerating QR tokens:", error);
    return { success: false, error: "Gagal regenerate QR tokens" };
  }
}
