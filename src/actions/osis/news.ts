"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/auth";
import { hasOsisAccess } from "@/lib/roles";

// --- Helper to verify OSIS access ---
async function verifyOsisAccess() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { authorized: false, error: "Unauthorized" };
  }

  // Check if user has OSIS access (role=OSIS OR siswa with osisAccess=true)
  const hasAccess = await hasOsisAccess(user.userId, user.role);
  if (!hasAccess) {
    return { authorized: false, error: "Akses OSIS diperlukan" };
  }

  return { authorized: true, user };
}

// --- Schema ---
const NewsSchema = z.object({
  title: z.string().min(5, "Judul minimal 5 karakter"),
  content: z.string().min(20, "Konten minimal 20 karakter"),
  image: z.string().optional(), // Cloudinary URL
  date: z.string().optional(), // Defaults to now
});

export async function getOsisNews() {
  const auth = await verifyOsisAccess();
  if (!auth.authorized) {
    return { success: false, data: [], error: auth.error };
  }

  const user = auth.user!;

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
  const auth = await verifyOsisAccess();
  if (!auth.authorized) return { success: false, error: auth.error };

  const user = auth.user!;

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
  const auth = await verifyOsisAccess();
  if (!auth.authorized) return { success: false, error: auth.error };

  const user = auth.user!;

  try {
    const existing = await prisma.news.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Berita tidak ditemukan" };

    if (existing.authorId !== user.userId) {
      return {
        success: false,
        error: "Anda tidak memiliki akses untuk menghapus berita ini",
      };
    }

    // Allow delete if pending only
    if (existing.statusPersetujuan !== "PENDING") {
      return {
        success: false,
        error: "Hanya berita dengan status pending yang dapat dihapus",
      };
    }

    await prisma.news.delete({ where: { id } });
    revalidatePath("/dashboard-osis");
    return { success: true, message: "Berita berhasil dihapus" };
  } catch (error) {
    console.error("Delete news error:", error);
    return { success: false, error: "Gagal menghapus berita" };
  }
}
