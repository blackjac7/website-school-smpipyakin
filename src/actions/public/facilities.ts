"use server";

import { prisma } from "@/lib/prisma";
import { facilities as staticFacilities } from "@/lib/data/facilities";

export interface PublicFacility {
  id: string;
  title: string;
  description: string;
  image: string;
}

/**
 * Get all facilities for public display
 */
export async function getPublicFacilities(): Promise<PublicFacility[]> {
  try {
    const facilities = await prisma.facility.findMany({
      orderBy: {
        title: "asc",
      },
    });

    if (facilities.length === 0) {
      // Fallback to static data if no data in database
      return staticFacilities.map((item) => ({
        id: item.id,
        title: item.name,
        description: item.description,
        image: item.image,
      }));
    }

    return facilities.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description || "",
      image: item.image || "",
    }));
  } catch (error) {
    console.error("Error fetching public facilities:", error);
    // Fallback to static data on error
    return staticFacilities.map((item) => ({
      id: item.id,
      title: item.name,
      description: item.description,
      image: item.image,
    }));
  }
}
