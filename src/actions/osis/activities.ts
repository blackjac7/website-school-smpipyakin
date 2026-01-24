"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/auth";
import { isAdminRole, hasOsisAccess } from "@/lib/roles";

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

// --- Schema Validation ---
const ActivitySchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid (YYYY-MM-DD)"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Format waktu tidak valid (HH:MM)"),
  location: z.string().min(3, "Lokasi wajib diisi"),
  budget: z.coerce.number().min(0, "Budget tidak boleh negatif"),
  participants: z.coerce.number().min(1, "Jumlah peserta minimal 1"),
  organizer: z.string().min(3, "Nama penanggung jawab wajib diisi"),
  proposalUrl: z.string().optional(),
});

// --- Actions ---

export async function getActivities() {
  const auth = await verifyOsisAccess();
  if (!auth.authorized) {
    return { success: false, error: auth.error, data: [] };
  }

  try {
    const activities = await prisma.osisActivity.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { username: true },
        },
      },
    });

    return { success: true, data: activities };
  } catch (error) {
    console.error("Error fetching activities:", error);
    return { success: false, error: "Failed to fetch activities", data: [] };
  }
}

export async function createActivity(prevState: unknown, formData: FormData) {
  const auth = await verifyOsisAccess();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  const user = auth.user!;


  const rawData = {
    title: formData.get("title"),
    description: formData.get("description"),
    date: formData.get("date"),
    time: formData.get("time"),
    location: formData.get("location"),
    budget: formData.get("budget"),
    participants: formData.get("participants"),
    organizer: formData.get("organizer"),
    proposalUrl: formData.get("proposalUrl") || undefined,
  };

  const validation = ActivitySchema.safeParse(rawData);

  if (!validation.success) {
    console.error("Validation error:", validation.error);
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
    return { success: true, message: "Program kerja berhasil diajukan" };
  } catch (error) {
    console.error("Create activity error:", error);
    return { success: false, error: "Gagal membuat program kerja" };
  }
}

export async function updateActivity(prevState: unknown, formData: FormData) {
  const auth = await verifyOsisAccess();
  if (!auth.authorized) return { success: false, error: auth.error };

  const user = auth.user!;

  const id = formData.get("id") as string;
  if (!id) return { success: false, error: "ID not provided" };

  // Fetch existing to check permissions
  const existing = await prisma.osisActivity.findUnique({ where: { id } });
  if (!existing) return { success: false, error: "Activity not found" };

  // Allow edit if Author OR Admin OR OSIS (shared?)
  // Usually only pending can be edited? Or always?
  // Let's allow edit if PENDING or if User is Admin.
  if (existing.status !== "PENDING" && !isAdminRole(user.role)) {
    return {
      success: false,
      error: "Hanya program kerja status PENDING yang dapat diubah",
    };
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
    return { success: true, message: "Program kerja berhasil diperbarui" };
  } catch (error) {
    console.error("Update activity error:", error);
    return { success: false, error: "Gagal memperbarui program kerja" };
  }
}

export async function deleteActivity(id: string) {
  const auth = await verifyOsisAccess();
  if (!auth.authorized) return { success: false, error: auth.error };

  const user = auth.user!;

  const existing = await prisma.osisActivity.findUnique({ where: { id } });
  if (!existing) return { success: false, error: "Not found" };

  if (existing.status !== "PENDING" && !isAdminRole(user.role)) {
    return { success: false, error: "Cannot delete processed activity" };
  }

  try {
    await prisma.osisActivity.delete({ where: { id } });
    revalidatePath("/dashboard-osis");
    return { success: true, message: "Program kerja dihapus" };
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = error;
    return { success: false, error: "Gagal menghapus" };
  }
}
