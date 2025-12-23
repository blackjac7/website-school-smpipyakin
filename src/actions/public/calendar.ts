"use server";

import { prisma } from "@/lib/prisma";
import { MOCK_ACTIVITIES } from "@/lib/data/homepage";

export interface PublicActivity {
  id: string;
  title: string;
  date: string;
  information: string;
  semester: "GANJIL" | "GENAP";
  tahunPelajaran: string;
}

/**
 * Get all activities for public calendar display
 */
export async function getPublicActivities(): Promise<PublicActivity[]> {
  try {
    const activities = await prisma.schoolActivity.findMany({
      orderBy: {
        date: "asc",
      },
    });

    if (activities.length === 0) {
      // Fallback to mock data if no activities in database
      return MOCK_ACTIVITIES.map((item) => ({
        id: item.id,
        title: item.title,
        date: item.date.toISOString(),
        information: item.information,
        semester: item.semester as "GANJIL" | "GENAP",
        tahunPelajaran: item.tahunPelajaran,
      }));
    }

    return activities.map((item) => ({
      id: item.id,
      title: item.title,
      date: item.date.toISOString(),
      information: item.information,
      semester: item.semester as "GANJIL" | "GENAP",
      tahunPelajaran: item.tahunPelajaran,
    }));
  } catch (error) {
    console.error("Error fetching public activities:", error);
    // Fallback to mock data on error
    return MOCK_ACTIVITIES.map((item) => ({
      id: item.id,
      title: item.title,
      date: item.date.toISOString(),
      information: item.information,
      semester: item.semester as "GANJIL" | "GENAP",
      tahunPelajaran: item.tahunPelajaran,
    }));
  }
}
