"use server";

import { prisma } from "@/lib/prisma";

export interface PublicNews {
  id: string;
  title: string;
  content: string;
  image: string;
  date: string;
  category: string;
}

/**
 * Get all approved news for public display
 */
export async function getPublicNews(): Promise<PublicNews[]> {
  try {
    const news = await prisma.news.findMany({
      where: {
        statusPersetujuan: "APPROVED",
      },
      orderBy: {
        date: "desc",
      },
    });

    return news.map((item) => ({
      id: item.id,
      title: item.title,
      content: item.content,
      image: item.image || "",
      date: formatDate(item.date),
      category: item.kategori === "ACHIEVEMENT" ? "achievement" : "activity",
    }));
  } catch (error) {
    console.error("Error fetching public news:", error);
    return [];
  }
}

/**
 * Get single news by ID
 */
export async function getNewsById(id: string): Promise<PublicNews | null> {
  try {
    const news = await prisma.news.findUnique({
      where: { id },
    });

    if (!news) {
      return null;
    }

    return {
      id: news.id,
      title: news.title,
      content: news.content,
      image: news.image || "",
      date: formatDate(news.date),
      category: news.kategori === "ACHIEVEMENT" ? "achievement" : "activity",
    };
  } catch (error) {
    console.error("Error fetching news by ID:", error);
    return null;
  }
}

function formatDate(date: Date): string {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];
  const d = new Date(date);
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}
