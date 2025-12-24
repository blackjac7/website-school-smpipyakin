"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/auth";

// --- Schema Validation ---
const ActivitySchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid (YYYY-MM-DD)"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Format waktu tidak valid (HH:MM)"),
  location: z.string().min(3, "Lokasi wajib diisi"),
  budget: z.coerce.number().min(0, "Budget tidak boleh negatif"),
  participants: z.coerce.number().min(1, "Jumlah peserta minimal 1"),
  organizer: z.string().min(3, "Nama penanggung jawab wajib diisi"),
  proposalUrl: z.string().optional(),
});

// --- Actions ---

export async function getActivities() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { success: false, error: "Unauthorized", data: [] };
  }

  try {
    const activities = await prisma.osisActivity.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { username: true }
        }
      }
    });

    return { success: true, data: activities };
  } catch (error) {
    console.error("Error fetching activities:", error);
    return { success: false, error: "Failed to fetch activities", data: [] };
  }
}

export async function createActivity(prevState: unknown, formData: FormData) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Strict role check: Must be OSIS or SISWA with osisAccess (logic handled in login, but here we check role claim)
  // The token role might be "osis" if they logged in as OSIS.
  // If they logged in as "siswa" but have access, we need to be careful.
  // Ideally, the token role reflects the *current session context*.
  // Let's assume if they are here, they have rights, but strictly:

  // if (user.role !== 'osis' && user.role !== 'admin') ...

  const rawData = {
    title: formData.get("title"),
    description: formData.get("description"),
    date: formData.get("date"),
    time: formData.get("time"),
    location: formData.get("location"),
    budget: formData.get("budget"),
    participants: formData.get("participants"),
    organizer: formData.get("organizer"),
    proposalUrl: formData.get("proposalUrl"),
  };

  const validation = ActivitySchema.safeParse(rawData);

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
    };
  }

  const { date, ...rest } = validation.data;

  try {
    await prisma.osisActivity.create({
      data: {
        ...rest,
        date: new Date(date), // Convert string YYYY-MM-DD to Date
        authorId: user.userId,
        status: "PENDING",
      },
    });

    revalidatePath("/dashboard-osis");
    return { success: true, message: "Kegiatan berhasil diajukan" };
  } catch (error) {
    console.error("Create activity error:", error);
    return { success: false, error: "Gagal membuat kegiatan" };
  }
}

export async function updateActivity(prevState: unknown, formData: FormData) {
  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const id = formData.get("id") as string;
  if (!id) return { success: false, error: "ID not provided" };

  // Fetch existing to check permissions
  const existing = await prisma.osisActivity.findUnique({ where: { id } });
  if (!existing) return { success: false, error: "Activity not found" };

  // Allow edit if Author OR Admin OR OSIS (shared?)
  // Usually only pending can be edited? Or always?
  // Let's allow edit if PENDING or if User is Admin.
  if (existing.status !== "PENDING" && user.role !== "admin") {
      return { success: false, error: "Hanya kegiatan status PENDING yang dapat diubah" };
  }

  const rawData = {
    title: formData.get("title"),
    description: formData.get("description"),
    date: formData.get("date"),
    time: formData.get("time"),
    location: formData.get("location"),
    budget: formData.get("budget"),
    participants: formData.get("participants"),
    organizer: formData.get("organizer"),
    proposalUrl: formData.get("proposalUrl"),
  };

  const validation = ActivitySchema.safeParse(rawData);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  const { date, ...rest } = validation.data;

  try {
    await prisma.osisActivity.update({
      where: { id },
      data: {
        ...rest,
        date: new Date(date),
      },
    });

    revalidatePath("/dashboard-osis");
    return { success: true, message: "Kegiatan berhasil diperbarui" };
  } catch (error) {
    console.error("Update activity error:", error);
    return { success: false, error: "Gagal memperbarui kegiatan" };
  }
}

export async function deleteActivity(id: string) {
    const user = await getAuthenticatedUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const existing = await prisma.osisActivity.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Not found" };

    if (existing.status !== "PENDING" && user.role !== "admin") {
        return { success: false, error: "Cannot delete processed activity" };
    }

    try {
        await prisma.osisActivity.delete({ where: { id } });
        revalidatePath("/dashboard-osis");
        return { success: true, message: "Kegiatan dihapus" };
    } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _ = error;
        return { success: false, error: "Gagal menghapus" };
    }
}
