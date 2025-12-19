"use server";

import { prisma } from "@/lib/prisma";
import { HeroSlide } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getHeroSlides() {
  try {
    const slides = await prisma.heroSlide.findMany({
      orderBy: { order: "asc" },
    });
    return slides;
  } catch (error) {
    console.error("Error fetching hero slides:", error);
    return [];
  }
}

export async function createHeroSlide(data: Omit<HeroSlide, "id" | "createdAt" | "updatedAt">) {
  try {
    const slide = await prisma.heroSlide.create({
      data,
    });
    revalidatePath("/");
    return { success: true, data: slide };
  } catch (error) {
    console.error("Error creating hero slide:", error);
    return { success: false, error: "Failed to create slide" };
  }
}

export async function updateHeroSlide(id: string, data: Partial<HeroSlide>) {
  try {
    const slide = await prisma.heroSlide.update({
      where: { id },
      data,
    });
    revalidatePath("/");
    return { success: true, data: slide };
  } catch (error) {
    console.error("Error updating hero slide:", error);
    return { success: false, error: "Failed to update slide" };
  }
}

export async function deleteHeroSlide(id: string) {
  try {
    await prisma.heroSlide.delete({
      where: { id },
    });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting hero slide:", error);
    return { success: false, error: "Failed to delete slide" };
  }
}
