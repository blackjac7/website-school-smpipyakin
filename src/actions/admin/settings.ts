"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import {
  getSetting,
  getSettingTyped,
  updateSetting,
  updateSettings,
  getSettingsByCategory,
  isPPDBOpen,
  isMaintenanceMode,
  DEFAULT_SETTINGS,
  type SettingKey,
} from "@/lib/siteSettings";

// =============================================
// GET SETTINGS
// =============================================

export async function getSettingsAction(category?: string) {
  try {
    if (category) {
      const settings = await getSettingsByCategory(category);
      return { success: true, data: settings };
    }

    const settings = await prisma.siteSettings.findMany({
      orderBy: [{ category: "asc" }, { key: "asc" }],
    });

    // Group by category
    const grouped = settings.reduce(
      (acc, setting) => {
        if (!acc[setting.category]) {
          acc[setting.category] = [];
        }
        acc[setting.category].push(setting);
        return acc;
      },
      {} as Record<string, typeof settings>
    );

    return { success: true, data: grouped };
  } catch (error) {
    console.error("Error fetching settings:", error);
    return { success: false, error: "Gagal mengambil pengaturan" };
  }
}

export async function getSettingAction(key: SettingKey) {
  try {
    const value = await getSetting(key);
    return { success: true, data: value };
  } catch (error) {
    console.error("Error fetching setting:", error);
    return { success: false, error: "Gagal mengambil pengaturan" };
  }
}

// =============================================
// UPDATE SETTINGS
// =============================================

export async function updateSettingAction(key: string, value: string) {
  try {
    await updateSetting(key, value);
    revalidatePath("/dashboard-admin/settings");
    revalidatePath("/");
    return { success: true, message: "Pengaturan berhasil diperbarui" };
  } catch (error) {
    console.error("Error updating setting:", error);
    return { success: false, error: "Gagal memperbarui pengaturan" };
  }
}

export async function updateSettingsAction(settings: Record<string, string>) {
  try {
    await updateSettings(settings);
    revalidatePath("/dashboard-admin/settings");
    revalidatePath("/");
    return { success: true, message: "Pengaturan berhasil diperbarui" };
  } catch (error) {
    console.error("Error updating settings:", error);
    return { success: false, error: "Gagal memperbarui pengaturan" };
  }
}

// =============================================
// MAINTENANCE MODE
// =============================================

export async function toggleMaintenanceMode(
  enabled: boolean,
  message?: string
) {
  try {
    const updates: Record<string, string> = {
      "maintenance.enabled": String(enabled),
    };

    if (message) {
      updates["maintenance.message"] = message;
    }

    await updateSettings(updates);

    // Set cookie for middleware to check (edge runtime compatible)
    const cookieStore = await cookies();
    if (enabled) {
      cookieStore.set("maintenance-mode", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    } else {
      cookieStore.delete("maintenance-mode");
    }

    revalidatePath("/");
    return {
      success: true,
      message: enabled
        ? "Mode pemeliharaan diaktifkan"
        : "Mode pemeliharaan dinonaktifkan",
    };
  } catch (error) {
    console.error("Error toggling maintenance mode:", error);
    return { success: false, error: "Gagal mengubah mode pemeliharaan" };
  }
}

export async function getMaintenanceStatus() {
  try {
    const isActive = await isMaintenanceMode();
    const message = await getSetting("maintenance.message");
    const allowedIPs = await getSettingTyped<string[]>(
      "maintenance.allowedIPs"
    );

    return {
      success: true,
      data: {
        isActive,
        message: message || "Website sedang dalam pemeliharaan.",
        allowedIPs: allowedIPs || [],
      },
    };
  } catch (error) {
    console.error("Error getting maintenance status:", error);
    return { success: false, error: "Gagal mengambil status pemeliharaan" };
  }
}

// =============================================
// SCHEDULED MAINTENANCE
// =============================================

export async function createMaintenanceSchedule(data: {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  affectedPaths?: string[];
  message?: string;
}) {
  try {
    const schedule = await prisma.maintenanceSchedule.create({
      data: {
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        affectedPaths: data.affectedPaths || [],
        message:
          data.message ||
          "Website sedang dalam pemeliharaan terjadwal. Silakan kembali beberapa saat lagi.",
        isActive: true,
      },
    });

    revalidatePath("/dashboard-admin/settings");
    return { success: true, data: schedule };
  } catch (error) {
    console.error("Error creating maintenance schedule:", error);
    return { success: false, error: "Gagal membuat jadwal pemeliharaan" };
  }
}

export async function getMaintenanceSchedules() {
  try {
    const schedules = await prisma.maintenanceSchedule.findMany({
      orderBy: { startTime: "desc" },
    });
    return { success: true, data: schedules };
  } catch (error) {
    console.error("Error fetching maintenance schedules:", error);
    return { success: false, error: "Gagal mengambil jadwal pemeliharaan" };
  }
}

export async function deleteMaintenanceSchedule(id: string) {
  try {
    await prisma.maintenanceSchedule.delete({ where: { id } });
    revalidatePath("/dashboard-admin/settings");
    return { success: true, message: "Jadwal pemeliharaan berhasil dihapus" };
  } catch (error) {
    console.error("Error deleting maintenance schedule:", error);
    return { success: false, error: "Gagal menghapus jadwal pemeliharaan" };
  }
}

// =============================================
// PPDB SETTINGS
// =============================================

export async function getPPDBStatus() {
  try {
    const status = await isPPDBOpen();
    const quota = await getSettingTyped<number>("ppdb.quota");

    // Get current registration count
    const registeredCount = await prisma.pPDBApplication.count();

    return {
      success: true,
      data: {
        ...status,
        quota: quota || 100,
        registeredCount,
        remainingQuota: Math.max(0, (quota || 100) - registeredCount),
      },
    };
  } catch (error) {
    console.error("Error getting PPDB status:", error);
    return { success: false, error: "Gagal mengambil status PPDB" };
  }
}

export async function updatePPDBSettings(data: {
  enabled: boolean;
  startDate?: string;
  endDate?: string;
  academicYear?: string;
  quota?: number;
  closedMessage?: string;
}) {
  try {
    const updates: Record<string, string> = {
      "ppdb.enabled": String(data.enabled),
    };

    if (data.startDate !== undefined) {
      updates["ppdb.startDate"] = data.startDate;
    }
    if (data.endDate !== undefined) {
      updates["ppdb.endDate"] = data.endDate;
    }
    if (data.academicYear) {
      updates["ppdb.academicYear"] = data.academicYear;
    }
    if (data.quota !== undefined) {
      updates["ppdb.quota"] = String(data.quota);
    }
    if (data.closedMessage) {
      updates["ppdb.closedMessage"] = data.closedMessage;
    }

    await updateSettings(updates);
    revalidatePath("/ppdb");
    revalidatePath("/dashboard-admin/settings");
    revalidatePath("/dashboard-ppdb");

    return {
      success: true,
      message: data.enabled ? "PPDB berhasil dibuka" : "PPDB berhasil ditutup",
    };
  } catch (error) {
    console.error("Error updating PPDB settings:", error);
    return { success: false, error: "Gagal memperbarui pengaturan PPDB" };
  }
}

// =============================================
// FEATURE FLAGS
// =============================================

export async function toggleFeature(
  feature: "chatbot" | "studentWorks" | "announcements",
  enabled: boolean
) {
  try {
    await updateSetting(`feature.${feature}`, String(enabled));
    revalidatePath("/");
    return {
      success: true,
      message: enabled
        ? `Fitur ${feature} diaktifkan`
        : `Fitur ${feature} dinonaktifkan`,
    };
  } catch (error) {
    console.error("Error toggling feature:", error);
    return { success: false, error: "Gagal mengubah status fitur" };
  }
}

export async function getFeatureFlags() {
  try {
    const chatbot = await getSettingTyped<boolean>("feature.chatbot");
    const studentWorks = await getSettingTyped<boolean>("feature.studentWorks");
    const announcements = await getSettingTyped<boolean>(
      "feature.announcements"
    );

    return {
      success: true,
      data: {
        chatbot: chatbot ?? true,
        studentWorks: studentWorks ?? true,
        announcements: announcements ?? true,
      },
    };
  } catch (error) {
    console.error("Error getting feature flags:", error);
    return { success: false, error: "Gagal mengambil status fitur" };
  }
}

// =============================================
// SEED SETTINGS
// =============================================

export async function seedSettingsAction() {
  try {
    const entries = Object.entries(DEFAULT_SETTINGS);

    for (const [key, config] of entries) {
      await prisma.siteSettings.upsert({
        where: { key },
        update: {},
        create: {
          key,
          value: config.value,
          type: config.type,
          category: config.category,
          description: config.description,
          isPublic: config.isPublic,
        },
      });
    }

    return {
      success: true,
      message: `${entries.length} pengaturan berhasil dibuat`,
    };
  } catch (error) {
    console.error("Error seeding settings:", error);
    return { success: false, error: "Gagal membuat pengaturan default" };
  }
}
