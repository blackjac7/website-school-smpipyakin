"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/auth";

// --- Schema ---
const NewsSchema = z.object({
  title: z.string().min(5, "Judul minimal 5 karakter"),
  content: z.string().min(20, "Konten minimal 20 karakter"),
  image: z.string().optional(), // Cloudinary URL
  date: z.string().optional(), // Defaults to now
});

export async function getOsisNews() {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error("Unauthorized");

  // Fetch news created by this user (or all OSIS news?)
  // Requirement: "osis bisa upload berita... tapi harus approve"
  // Usually they want to see their own drafts.

  const news = await prisma.news.findMany({
    where: {
      authorId: user.userId,
    },
    orderBy: { createdAt: "desc" },
  });

  return { success: true, data: news };
}

export async function createOsisNews(prevState: unknown, formData: FormData) {
  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const rawData = {
    title: formData.get("title"),
    content: formData.get("content"),
    image: formData.get("image"),
    date: formData.get("date"),
  };

  const validation = NewsSchema.safeParse(rawData);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  const { title, content, image, date } = validation.data;

  try {
    await prisma.news.create({
      data: {
        title,
        content,
        image,
        date: date ? new Date(date) : new Date(),
        kategori: "ACTIVITY", // Enforced for OSIS
        statusPersetujuan: "PENDING", // Enforced
        authorId: user.userId,
      },
    });

    revalidatePath("/dashboard-osis");
    return { success: true, message: "Berita berhasil diajukan" };
  } catch (error) {
    console.error("Create news error:", error);
    return { success: false, error: "Gagal membuat berita" };
  }
}

export async function deleteOsisNews(id: string) {
    const user = await getAuthenticatedUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const existing = await prisma.news.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Not found" };

    if (existing.authorId !== user.userId) {
        return { success: false, error: "Forbidden" };
    }

    // Allow delete if pending?
    if (existing.statusPersetujuan !== "PENDING") {
         return { success: false, error: "Cannot delete processed news" };
    }

    try {
        await prisma.news.delete({ where: { id } });
        revalidatePath("/dashboard-osis");
        return { success: true, message: "Berita dihapus" };
    } catch (e) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _ = e;
        return { success: false, error: "Error deleting" };
    }
}
