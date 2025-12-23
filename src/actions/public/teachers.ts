"use server";

import { prisma } from "@/lib/prisma";
import { teachers as staticTeachers } from "@/lib/data/teachers";

export interface PublicTeacher {
  id: string;
  name: string;
  position: string;
  category: "Pimpinan" | "Guru Mata Pelajaran" | "Staff";
  photo: string;
  subject?: string;
  description?: string;
  experience?: string;
}

// Map database category enum to display format
function mapCategory(
  category: string
): "Pimpinan" | "Guru Mata Pelajaran" | "Staff" {
  switch (category) {
    case "PIMPINAN":
      return "Pimpinan";
    case "GURU_MAPEL":
      return "Guru Mata Pelajaran";
    case "STAFF":
      return "Staff";
    default:
      return "Guru Mata Pelajaran";
  }
}

/**
 * Get all teachers for public display
 */
export async function getPublicTeachers(): Promise<PublicTeacher[]> {
  try {
    const teachers = await prisma.teacher.findMany({
      where: {
        isActive: true,
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    if (teachers.length === 0) {
      // Fallback to static data if no data in database
      return staticTeachers;
    }

    return teachers.map((item) => ({
      id: item.id,
      name: item.name,
      position: item.position,
      category: mapCategory(item.category),
      photo: item.photo || "",
      subject: item.subject || undefined,
      description: item.description || undefined,
      experience: item.experience || undefined,
    }));
  } catch (error) {
    console.error("Error fetching public teachers:", error);
    // Fallback to static data on error
    return staticTeachers;
  }
}

/**
 * Get teachers by category
 */
export async function getTeachersByCategory(
  category: "Pimpinan" | "Guru Mata Pelajaran" | "Staff"
): Promise<PublicTeacher[]> {
  const allTeachers = await getPublicTeachers();
  return allTeachers.filter((t) => t.category === category);
}

/**
 * Get only teachers (Pimpinan + Guru Mata Pelajaran), excluding Staff
 */
export async function getTeachersOnly(): Promise<PublicTeacher[]> {
  const allTeachers = await getPublicTeachers();
  return allTeachers.filter(
    (t) => t.category === "Pimpinan" || t.category === "Guru Mata Pelajaran"
  );
}

/**
 * Get leadership (Pimpinan) teachers only
 */
export async function getLeadershipTeachers(): Promise<PublicTeacher[]> {
  return getTeachersByCategory("Pimpinan");
}
