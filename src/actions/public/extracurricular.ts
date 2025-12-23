"use server";

import { prisma } from "@/lib/prisma";
import { activities as staticActivities } from "@/lib/data/extracurricular";

export interface PublicExtracurricular {
  id: string;
  title: string;
  description: string;
  image: string;
  schedule: string;
}

/**
 * Get all extracurriculars for public display
 */
export async function getPublicExtracurriculars(): Promise<
  PublicExtracurricular[]
> {
  try {
    const extracurriculars = await prisma.extracurricular.findMany({
      orderBy: {
        title: "asc",
      },
    });

    if (extracurriculars.length === 0) {
      // Fallback to static data if no data in database
      return staticActivities.map((item) => ({
        id: item.id,
        title: item.name,
        description: item.description,
        image: item.image,
        schedule: Array.isArray(item.schedule)
          ? item.schedule.join(" & ")
          : item.schedule,
      }));
    }

    return extracurriculars.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description || "",
      image: item.image || "",
      schedule: item.schedule || "",
    }));
  } catch (error) {
    console.error("Error fetching public extracurriculars:", error);
    // Fallback to static data on error
    return staticActivities.map((item) => ({
      id: item.id,
      title: item.name,
      description: item.description,
      image: item.image,
      schedule: Array.isArray(item.schedule)
        ? item.schedule.join(" & ")
        : item.schedule,
    }));
  }
}
