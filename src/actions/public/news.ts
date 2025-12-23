"use server";

import { prisma } from "@/lib/prisma";
import { STATIC_NEWS } from "@/lib/data/homepage";

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

    if (news.length === 0) {
      // Fallback to static data if no news in database
      return STATIC_NEWS.map((item) => ({
        id: item.id,
        title: item.title,
        content: item.content,
        image: item.image || "",
        date: formatDate(item.date),
        category: item.kategori === "ACHIEVEMENT" ? "achievement" : "activity",
      }));
    }

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
    // Fallback to static data on error
    return STATIC_NEWS.map((item) => ({
      id: item.id,
      title: item.title,
      content: item.content,
      image: item.image || "",
      date: formatDate(item.date),
      category: item.kategori === "ACHIEVEMENT" ? "achievement" : "activity",
    }));
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
      // Try static data
      const staticNews = STATIC_NEWS.find((item) => item.id === id);
      if (staticNews) {
        return {
          id: staticNews.id,
          title: staticNews.title,
          content: staticNews.content,
          image: staticNews.image || "",
          date: formatDate(staticNews.date),
          category:
            staticNews.kategori === "ACHIEVEMENT" ? "achievement" : "activity",
        };
      }
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
