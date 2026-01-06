"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { News, BeritaKategori } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getAuthenticatedUser } from "@/lib/auth";

// Validation schemas
const CreateNewsSchema = z.object({
  title: z
    .string()
    .min(5, "Judul minimal 5 karakter")
    .max(200, "Judul maksimal 200 karakter"),
  excerpt: z.string().optional(),
  content: z.string().min(20, "Konten minimal 20 karakter"),
  image: z.string().url("URL gambar tidak valid").optional().or(z.literal("")),
  date: z.coerce.date(),
  category: z.enum(["ACHIEVEMENT", "ACTIVITY"]),
  author: z.string().optional(),
});

const DeleteNewsSchema = z.object({
  id: z.string().uuid("Invalid news ID"),
});

// Helper to verify admin role for news management
import { isAdminRole } from "@/lib/roles";

async function verifyAdminRole() {
  const user = await getAuthenticatedUser();
  // Use centralized role helper to account for token/enumeration normalization
  if (!user || !isAdminRole(user.role)) {
    console.error("verifyAdminRole: unauthorized user or role", { user });
    return { authorized: false, error: "Unauthorized: Admin access required" };
  }
  return { authorized: true, user };
}

export async function getAllNews() {
  try {
    const news = await prisma.news.findMany({
      orderBy: { date: "desc" },
    });
    return news;
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
}

export async function getPublishedNews(limit?: number) {
  try {
    const news = await prisma.news.findMany({
      where: { statusPersetujuan: "APPROVED" },
      orderBy: { date: "desc" },
      take: limit,
    });
    return news;
  } catch (error) {
    console.error("Error fetching published news:", error);
    return [];
  }
}

export async function createNews(data: {
  title: string;
  excerpt?: string;
  content: string;
  image?: string;
  date: Date;
  category: BeritaKategori;
  author?: string;
}) {
  const auth = await verifyAdminRole();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  // Validate input
  const validation = CreateNewsSchema.safeParse(data);
  if (!validation.success) {
    console.error("createNews validation failed:", validation.error.issues, {
      input: data,
      auth,
    });
    return { success: false, error: validation.error.issues[0].message };
  }

  try {
    const authorId = auth.user!.userId;
    const validData = validation.data;

    const news = await prisma.news.create({
      data: {
        title: validData.title,
        content: validData.content,
        image: validData.image || null,
        date: validData.date,
        kategori: validData.category,
        statusPersetujuan: "APPROVED",
        authorId: authorId,
      },
    });
    revalidatePath("/news");
    revalidatePath("/");
    revalidatePath("/dashboard-admin/news");
    return { success: true, data: news };
  } catch (error) {
    console.error("Error creating news:", error);
    return { success: false, error: "Failed to create news" };
  }
}

export async function updateNews(id: string, data: Partial<News>) {
  const auth = await verifyAdminRole();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  // Validate ID
  const idValidation = z.string().uuid("Invalid news ID").safeParse(id);
  if (!idValidation.success) {
    return { success: false, error: idValidation.error.issues[0].message };
  }

  try {
    const news = await prisma.news.update({
      where: { id: idValidation.data },
      data,
    });
    revalidatePath("/news");
    revalidatePath("/");
    revalidatePath("/dashboard-admin/news");
    return { success: true, data: news };
  } catch (error) {
    console.error("Error updating news:", error);
    return { success: false, error: "Failed to update news" };
  }
}

export async function deleteNews(id: string) {
  const auth = await verifyAdminRole();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  // Validate input
  const validation = DeleteNewsSchema.safeParse({ id });
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  try {
    await prisma.news.delete({
      where: { id: validation.data.id },
    });
    revalidatePath("/news");
    revalidatePath("/");
    revalidatePath("/dashboard-admin/news");
    return { success: true };
  } catch (error) {
    console.error("Error deleting news:", error);
    return { success: false, error: "Failed to delete news" };
  }
}
