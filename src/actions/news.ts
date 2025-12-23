"use server";

import { prisma } from "@/lib/prisma";
import { News, BeritaKategori } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getAuthenticatedUser } from "@/lib/auth";

// Helper to verify admin role for news management
async function verifyAdminRole() {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== "admin") {
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
  excerpt: string;
  content: string;
  image: string;
  date: Date;
  category: BeritaKategori;
  author: string;
}) {
  const auth = await verifyAdminRole();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    // Use authenticated user's ID as author
    const authorId = auth.user!.userId;

    const news = await prisma.news.create({
      data: {
        title: data.title,
        content: data.content,
        image: data.image,
        date: data.date,
        kategori: data.category,
        statusPersetujuan: "APPROVED", // Admin-created news is auto-approved
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

  try {
    const news = await prisma.news.update({
      where: { id },
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

  try {
    await prisma.news.delete({
      where: { id },
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
