"use server";

import { prisma } from "@/lib/prisma";

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

    return facilities.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description || "",
      image: item.image || "",
    }));
  } catch (error) {
    console.error("Error fetching public facilities:", error);
    return [];
  }
}
