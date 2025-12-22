"use server";

import { prisma } from "@/lib/prisma";
import { News, BeritaKategori } from "@prisma/client";
import { revalidatePath } from "next/cache";

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
  try {
    // We need an authorId.
    let authorId = "";
    const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    if (admin) authorId = admin.id;
    else throw new Error("No author/admin found.");


    const news = await prisma.news.create({
      data: {
        title: data.title,
        content: data.content,
        image: data.image,
        date: data.date,
        kategori: data.category,
        statusPersetujuan: "APPROVED",
        authorId: authorId,
      },
    });
    revalidatePath("/news");
    revalidatePath("/");
    return { success: true, data: news };
  } catch (error) {
    console.error("Error creating news:", error);
    return { success: false, error: "Failed to create news" };
  }
}

export async function updateNews(id: string, data: Partial<News>) {
  try {
    const news = await prisma.news.update({
      where: { id },
      data,
    });
    revalidatePath("/news");
    revalidatePath("/");
    return { success: true, data: news };
  } catch (error) {
    console.error("Error updating news:", error);
    return { success: false, error: "Failed to update news" };
  }
}

export async function deleteNews(id: string) {
  try {
    await prisma.news.delete({
      where: { id },
    });
    revalidatePath("/news");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting news:", error);
    return { success: false, error: "Failed to delete news" };
  }
}
