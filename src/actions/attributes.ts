"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getAuthenticatedUser } from "@/lib/auth";
import { hasOsisAccess, isRoleMatch, isSiswaRole } from "@/lib/roles";
import {
  validateQRScan,
  formatTimeWIB,
  isWithinAttributeWindow,
  isAfterAttributeWindow,
} from "@/lib/qr-token";
import { updateSettings } from "@/lib/siteSettings";
import {
  getAttributePointConfig,
  calculateAttributePoints,
} from "@/lib/attributePoints";
import { revalidatePath } from "next/cache";
import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  startOfYear,
  endOfDay,
} from "date-fns";
import { toZonedTime } from "date-fns-tz";

const WIB_TIMEZONE = "Asia/Jakarta";

// =============================================
// HELPER FUNCTIONS
// =============================================

async function verifyOsisAccess() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { authorized: false, error: "Unauthorized" };
  }

  const hasAccess = await hasOsisAccess(user.userId, user.role);
  if (!hasAccess) {
    return { authorized: false, error: "Akses OSIS diperlukan" };
  }

  return { authorized: true, user };
}

async function verifyKesiswaanAccess() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { authorized: false, error: "Unauthorized" };
  }

  if (!isRoleMatch(user.role, ["kesiswaan", "admin"])) {
    return { authorized: false, error: "Akses Kesiswaan diperlukan" };
  }

  return { authorized: true, user };
}

export type Period = "day" | "week" | "month" | "year" | "custom";

function getDateRange(period: Period, customStart?: Date, customEnd?: Date) {
  const now = new Date();
  const zonedNow = toZonedTime(now, WIB_TIMEZONE);

  if (period === "custom" && customStart && customEnd) {
    return {
      start: startOfDay(toZonedTime(customStart, WIB_TIMEZONE)),
      end: endOfDay(toZonedTime(customEnd, WIB_TIMEZONE)),
    };
  }

  switch (period) {
    case "day":
      return { start: startOfDay(zonedNow), end: endOfDay(zonedNow) };
    case "week":
      return {
        start: startOfWeek(zonedNow, { weekStartsOn: 1 }),
        end: endOfDay(zonedNow),
      };
    case "month":
      return { start: startOfMonth(zonedNow), end: endOfDay(zonedNow) };
    case "year":
      return { start: startOfYear(zonedNow), end: endOfDay(zonedNow) };
    default:
      return { start: startOfDay(zonedNow), end: endOfDay(zonedNow) };
  }
}

// =============================================
// ATTRIBUTE ITEMS (OSIS - read-only, for scanner checklist)
// =============================================

export async function getActiveAttributeItems() {
  const auth = await verifyOsisAccess();
  if (!auth.authorized) {
    return { success: false, error: auth.error, data: [] };
  }

  try {
    const items = await prisma.attributeItem.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      select: { id: true, name: true, description: true },
    });

    return { success: true, data: items };
  } catch (error) {
    console.error("Error getting attribute items:", error);
    return {
      success: false,
      error: "Gagal mengambil daftar atribut",
      data: [],
    };
  }
}

// =============================================
// ATTRIBUTE VIOLATION SCANNING (OSIS)
// =============================================

export async function verifyAttributeScanQR(qrData: string) {
  const auth = await verifyOsisAccess();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  // Attribute scanning is only allowed within the window: after 06:30 WIB, up to 14:00 WIB
  if (!isWithinAttributeWindow()) {
    const error = isAfterAttributeWindow()
      ? `Waktu pencatatan pelanggaran atribut sudah berakhir (sampai pukul 14:00 WIB). Sekarang pukul ${formatTimeWIB()} WIB.`
      : `Belum waktunya pencatatan pelanggaran atribut. Pencatatan dimulai pukul 06:31 WIB (sekarang ${formatTimeWIB()} WIB).`;
    return { success: false, error };
  }

  try {
    const siswaId = validateQRScan(qrData);
    if (!siswaId) {
      return { success: false, error: "QR Code tidak valid" };
    }

    const siswa = await prisma.siswa.findUnique({
      where: { id: siswaId },
      include: {
        user: { select: { username: true } },
      },
    });

    if (!siswa) {
      return { success: false, error: "Siswa tidak ditemukan" };
    }

    const today = new Date();
    const startOfToday = startOfDay(toZonedTime(today, WIB_TIMEZONE));
    const endOfToday = endOfDay(toZonedTime(today, WIB_TIMEZONE));

    const existingRecord = await prisma.attributeViolation.findFirst({
      where: {
        siswaId: siswa.id,
        date: { gte: startOfToday, lte: endOfToday },
      },
    });

    if (existingRecord) {
      return {
        success: false,
        error: "Siswa sudah tercatat pelanggaran atribut hari ini",
        alreadyRecorded: true,
        student: {
          id: siswa.id,
          name: siswa.name,
          nisn: siswa.nisn,
          class: siswa.class,
        },
      };
    }

    const attributeItems = await prisma.attributeItem.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      select: { id: true, name: true, description: true },
    });

    return {
      success: true,
      student: {
        id: siswa.id,
        name: siswa.name,
        nisn: siswa.nisn,
        class: siswa.class,
        image: siswa.image,
      },
      currentTime: formatTimeWIB(),
      attributeItems,
    };
  } catch (error) {
    console.error("Error verifying attribute QR:", error);
    return { success: false, error: "Gagal memverifikasi QR" };
  }
}

export async function recordAttributeViolation(
  siswaId: string,
  scanTime: string,
  attributeItemIds: string[],
  notes?: string,
) {
  const auth = await verifyOsisAccess();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  if (!isWithinAttributeWindow()) {
    const error = isAfterAttributeWindow()
      ? `Waktu pencatatan pelanggaran atribut sudah berakhir (sampai pukul 14:00 WIB). Sekarang pukul ${formatTimeWIB()} WIB.`
      : `Belum waktunya pencatatan pelanggaran atribut. Pencatatan dimulai pukul 06:31 WIB (sekarang ${formatTimeWIB()} WIB).`;
    return { success: false, error };
  }

  if (!attributeItemIds || attributeItemIds.length === 0) {
    return {
      success: false,
      error: "Pilih minimal satu atribut yang dilanggar",
    };
  }

  try {
    const siswa = await prisma.siswa.findUnique({
      where: { id: siswaId },
      select: { id: true, name: true },
    });

    if (!siswa) {
      return { success: false, error: "Siswa tidak ditemukan" };
    }

    const validItems = await prisma.attributeItem.findMany({
      where: { id: { in: attributeItemIds }, active: true },
      select: { id: true },
    });

    if (validItems.length !== attributeItemIds.length) {
      return {
        success: false,
        error: "Beberapa atribut yang dipilih tidak valid",
      };
    }

    const today = new Date();
    const startOfToday = startOfDay(toZonedTime(today, WIB_TIMEZONE));
    const endOfToday = endOfDay(toZonedTime(today, WIB_TIMEZONE));

    const existingRecord = await prisma.attributeViolation.findFirst({
      where: {
        siswaId,
        date: { gte: startOfToday, lte: endOfToday },
      },
    });

    if (existingRecord) {
      return {
        success: false,
        error: "Siswa sudah tercatat pelanggaran atribut hari ini",
      };
    }

    await prisma.attributeViolation.create({
      data: {
        siswaId,
        scanTime,
        notes: notes || null,
        recordedBy: auth.user!.userId,
        items: {
          create: attributeItemIds.map((attributeItemId) => ({
            attributeItemId,
          })),
        },
      },
    });

    revalidatePath("/dashboard-osis/keterlambatan");
    revalidatePath("/dashboard-kesiswaan/keterlambatan");

    return {
      success: true,
      message: `Pelanggaran atribut ${siswa.name} berhasil dicatat`,
    };
  } catch (error) {
    console.error("Error recording attribute violation:", error);
    return { success: false, error: "Gagal mencatat pelanggaran atribut" };
  }
}

// =============================================
// ATTRIBUTE VIOLATION REPORTS (KESISWAAN)
// =============================================

export async function getAttributeStats() {
  const auth = await verifyKesiswaanAccess();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    const [dayCount, weekCount, monthCount, yearCount] = await Promise.all([
      prisma.attributeViolation.count({
        where: {
          date: {
            gte: getDateRange("day").start,
            lte: getDateRange("day").end,
          },
        },
      }),
      prisma.attributeViolation.count({
        where: {
          date: {
            gte: getDateRange("week").start,
            lte: getDateRange("week").end,
          },
        },
      }),
      prisma.attributeViolation.count({
        where: {
          date: {
            gte: getDateRange("month").start,
            lte: getDateRange("month").end,
          },
        },
      }),
      prisma.attributeViolation.count({
        where: {
          date: {
            gte: getDateRange("year").start,
            lte: getDateRange("year").end,
          },
        },
      }),
    ]);

    return {
      success: true,
      stats: {
        day: dayCount,
        week: weekCount,
        month: monthCount,
        year: yearCount,
      },
    };
  } catch (error) {
    console.error("Error getting attribute stats:", error);
    return { success: false, error: "Gagal mengambil statistik" };
  }
}

export async function getAttributeViolations(
  period: Period = "day",
  classFilter?: string,
  page: number = 1,
  limit: number = 20,
  customStart?: Date,
  customEnd?: Date,
  search?: string,
) {
  const auth = await verifyKesiswaanAccess();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    const { start, end } = getDateRange(period, customStart, customEnd);
    const skip = (page - 1) * limit;

    const where: Prisma.AttributeViolationWhereInput = {
      date: { gte: start, lte: end },
    };

    if (classFilter && classFilter !== "all") {
      where.siswa = { class: classFilter };
    }

    if (search) {
      where.OR = [
        { siswa: { name: { contains: search, mode: "insensitive" } } },
        { siswa: { nisn: { contains: search } } },
      ];
    }

    const [records, totalCount] = await Promise.all([
      prisma.attributeViolation.findMany({
        where,
        include: {
          siswa: {
            select: { name: true, nisn: true, class: true, image: true },
          },
          recorder: {
            select: {
              username: true,
              siswa: { select: { name: true } },
              kesiswaan: { select: { name: true } },
            },
          },
          items: {
            include: { attributeItem: { select: { name: true } } },
          },
        },
        orderBy: { date: "desc" },
        skip,
        take: limit,
      }),
      prisma.attributeViolation.count({ where }),
    ]);

    return {
      success: true,
      records: records.map((r) => ({
        id: r.id,
        siswaName: r.siswa.name,
        nisn: r.siswa.nisn,
        class: r.siswa.class,
        scanTime: r.scanTime,
        date: r.date,
        notes: r.notes,
        attributes: r.items.map((i) => i.attributeItem.name),
        recordedBy:
          r.recorder.siswa?.name ||
          r.recorder.kesiswaan?.name ||
          r.recorder.username,
      })),
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      page,
    };
  } catch (error) {
    console.error("Error getting attribute violations:", error);
    return {
      success: false,
      error: "Gagal mengambil data pelanggaran atribut",
    };
  }
}

export async function getAttributeViolationsByClass(
  period: Period = "month",
  customStart?: Date,
  customEnd?: Date,
) {
  const auth = await verifyKesiswaanAccess();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    const { start, end } = getDateRange(period, customStart, customEnd);

    const records = await prisma.attributeViolation.findMany({
      where: { date: { gte: start, lte: end } },
      include: { siswa: { select: { class: true } } },
    });

    const byClass: Record<string, number> = {};
    records.forEach((r) => {
      const cls = r.siswa.class || "Tidak ada kelas";
      byClass[cls] = (byClass[cls] || 0) + 1;
    });

    const chartData = Object.entries(byClass)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return { success: true, data: chartData };
  } catch (error) {
    console.error("Error getting attribute violations by class:", error);
    return { success: false, error: "Gagal mengambil data per kelas" };
  }
}

export async function getAttributeViolationTrend(
  period: Period = "month",
  customStart?: Date,
  customEnd?: Date,
) {
  const auth = await verifyKesiswaanAccess();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    const { start, end } = getDateRange(period, customStart, customEnd);

    const records = await prisma.attributeViolation.findMany({
      where: { date: { gte: start, lte: end } },
      select: { date: true },
      orderBy: { date: "asc" },
    });

    const byDate: Record<string, number> = {};
    records.forEach((r) => {
      const dateStr = r.date.toISOString().split("T")[0];
      byDate[dateStr] = (byDate[dateStr] || 0) + 1;
    });

    const chartData = Object.entries(byDate).map(([date, count]) => ({
      date,
      count,
    }));

    return { success: true, data: chartData };
  } catch (error) {
    console.error("Error getting attribute violation trend:", error);
    return { success: false, error: "Gagal mengambil trend data" };
  }
}

export async function getMostViolatedAttributes(
  period: Period = "month",
  customStart?: Date,
  customEnd?: Date,
) {
  const auth = await verifyKesiswaanAccess();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    const { start, end } = getDateRange(period, customStart, customEnd);

    const items = await prisma.attributeViolationItem.findMany({
      where: { violation: { date: { gte: start, lte: end } } },
      include: { attributeItem: { select: { name: true } } },
    });

    const byAttribute: Record<string, number> = {};
    items.forEach((i) => {
      const name = i.attributeItem.name;
      byAttribute[name] = (byAttribute[name] || 0) + 1;
    });

    const chartData = Object.entries(byAttribute)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return { success: true, data: chartData };
  } catch (error) {
    console.error("Error getting most violated attributes:", error);
    return { success: false, error: "Gagal mengambil data atribut terbanyak" };
  }
}

// =============================================
// ATTRIBUTE POINT SYSTEM (KESISWAAN)
// =============================================

export async function getAttributePointSettings() {
  const auth = await verifyKesiswaanAccess();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    const config = await getAttributePointConfig();
    return { success: true, data: config };
  } catch (error) {
    console.error("Error getting attribute point settings:", error);
    return {
      success: false,
      error: "Gagal mengambil pengaturan poin atribut",
    };
  }
}

export async function updateAttributePointSettings(
  threshold: number,
  pointsPerThreshold: number,
) {
  const auth = await verifyKesiswaanAccess();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  if (!Number.isFinite(threshold) || threshold < 1) {
    return {
      success: false,
      error: "Jumlah akumulasi pelanggaran minimal 1",
    };
  }

  if (!Number.isFinite(pointsPerThreshold) || pointsPerThreshold < 0) {
    return { success: false, error: "Jumlah poin tidak boleh negatif" };
  }

  try {
    await updateSettings({
      "attribute.pointThreshold": String(Math.trunc(threshold)),
      "attribute.pointsPerThreshold": String(Math.trunc(pointsPerThreshold)),
    });

    revalidatePath("/dashboard-kesiswaan/settings");
    revalidatePath("/dashboard-kesiswaan/keterlambatan");
    revalidatePath("/dashboard-kesiswaan/siswa");

    return {
      success: true,
      message: "Pengaturan poin pelanggaran atribut berhasil disimpan",
    };
  } catch (error) {
    console.error("Error updating attribute point settings:", error);
    return {
      success: false,
      error: "Gagal menyimpan pengaturan poin pelanggaran atribut",
    };
  }
}

export async function getAttributePointsSummary(
  classFilter?: string,
  search?: string,
) {
  const auth = await verifyKesiswaanAccess();
  if (!auth.authorized) {
    return { success: false, error: auth.error, data: [] };
  }

  try {
    const { threshold, pointsPerThreshold } = await getAttributePointConfig();

    const where: Prisma.SiswaWhereInput = {
      attributeViolations: { some: {} },
    };

    if (classFilter && classFilter !== "all") {
      where.class = classFilter;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { nisn: { contains: search } },
      ];
    }

    const students = await prisma.siswa.findMany({
      where,
      select: {
        id: true,
        name: true,
        nisn: true,
        class: true,
        _count: { select: { attributeViolations: true } },
      },
    });

    const data = students
      .map((s) => ({
        siswaId: s.id,
        name: s.name,
        nisn: s.nisn,
        class: s.class,
        totalViolations: s._count.attributeViolations,
        points: calculateAttributePoints(
          s._count.attributeViolations,
          threshold,
          pointsPerThreshold,
        ),
      }))
      .filter((s) => s.points > 0)
      .sort(
        (a, b) => b.points - a.points || b.totalViolations - a.totalViolations,
      );

    return {
      success: true,
      data,
      config: { threshold, pointsPerThreshold },
    };
  } catch (error) {
    console.error("Error getting attribute points summary:", error);
    return {
      success: false,
      error: "Gagal mengambil data poin pelanggaran atribut",
      data: [],
    };
  }
}

// =============================================
// ATTRIBUTE POINTS (STUDENT SELF-VIEW)
// =============================================

/**
 * Self-only, resolves via session — a student can never query another
 * student's data (same IDOR-safe pattern as getMyLatenessPoints).
 */
export async function getMyAttributePoints() {
  const user = await getAuthenticatedUser();
  if (!user || !isSiswaRole(user.role)) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const siswa = await prisma.siswa.findUnique({
      where: { userId: user.userId },
      select: {
        _count: { select: { attributeViolations: true } },
      },
    });

    if (!siswa) {
      return { success: false, error: "Data siswa tidak ditemukan" };
    }

    const { threshold, pointsPerThreshold } = await getAttributePointConfig();
    const totalViolations = siswa._count.attributeViolations;
    const points = calculateAttributePoints(
      totalViolations,
      threshold,
      pointsPerThreshold,
    );

    return {
      success: true,
      data: { totalViolations, points, threshold, pointsPerThreshold },
    };
  } catch (error) {
    console.error("Error getting student attribute points:", error);
    return {
      success: false,
      error: "Gagal mengambil data poin pelanggaran atribut",
    };
  }
}

// =============================================
// ATTRIBUTE ITEM MANAGEMENT (KESISWAAN)
// =============================================

export async function getAttributeItemsForManagement() {
  const auth = await verifyKesiswaanAccess();
  if (!auth.authorized) {
    return { success: false, error: auth.error, data: [] };
  }

  try {
    const items = await prisma.attributeItem.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { violationItems: true } } },
    });

    return {
      success: true,
      data: items.map((i) => ({
        id: i.id,
        name: i.name,
        description: i.description,
        active: i.active,
        order: i.order,
        usageCount: i._count.violationItems,
      })),
    };
  } catch (error) {
    console.error("Error getting attribute items:", error);
    return {
      success: false,
      error: "Gagal mengambil daftar atribut",
      data: [],
    };
  }
}

export async function createAttributeItem(name: string, description?: string) {
  const auth = await verifyKesiswaanAccess();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  const trimmedName = name.trim();
  if (!trimmedName) {
    return { success: false, error: "Nama atribut tidak boleh kosong" };
  }

  try {
    const maxOrder = await prisma.attributeItem.aggregate({
      _max: { order: true },
    });

    await prisma.attributeItem.create({
      data: {
        name: trimmedName,
        description: description || null,
        order: (maxOrder._max.order ?? 0) + 1,
      },
    });

    revalidatePath("/dashboard-kesiswaan/settings");
    revalidatePath("/dashboard-osis/keterlambatan");

    return { success: true, message: "Atribut berhasil ditambahkan" };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { success: false, error: "Atribut dengan nama ini sudah ada" };
    }
    console.error("Error creating attribute item:", error);
    return { success: false, error: "Gagal menambahkan atribut" };
  }
}

export async function updateAttributeItem(
  id: string,
  data: { name?: string; description?: string; active?: boolean },
) {
  const auth = await verifyKesiswaanAccess();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    const updateData: Prisma.AttributeItemUpdateInput = {};
    if (data.name !== undefined) {
      const trimmedName = data.name.trim();
      if (!trimmedName) {
        return { success: false, error: "Nama atribut tidak boleh kosong" };
      }
      updateData.name = trimmedName;
    }
    if (data.description !== undefined) {
      updateData.description = data.description || null;
    }
    if (data.active !== undefined) {
      updateData.active = data.active;
    }

    await prisma.attributeItem.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/dashboard-kesiswaan/settings");
    revalidatePath("/dashboard-osis/keterlambatan");

    return { success: true, message: "Atribut berhasil diperbarui" };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { success: false, error: "Atribut dengan nama ini sudah ada" };
    }
    console.error("Error updating attribute item:", error);
    return { success: false, error: "Gagal memperbarui atribut" };
  }
}

/**
 * Deleting a never-used attribute removes it entirely; one already
 * referenced by history is soft-deleted (active=false) to keep past reports intact.
 */
export async function deleteAttributeItem(id: string) {
  const auth = await verifyKesiswaanAccess();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    const usageCount = await prisma.attributeViolationItem.count({
      where: { attributeItemId: id },
    });

    if (usageCount > 0) {
      await prisma.attributeItem.update({
        where: { id },
        data: { active: false },
      });
      revalidatePath("/dashboard-kesiswaan/settings");
      revalidatePath("/dashboard-osis/keterlambatan");
      return {
        success: true,
        message:
          "Atribut sudah pernah digunakan di riwayat, dinonaktifkan (bukan dihapus) agar laporan lama tetap utuh",
      };
    }

    await prisma.attributeItem.delete({ where: { id } });

    revalidatePath("/dashboard-kesiswaan/settings");
    revalidatePath("/dashboard-osis/keterlambatan");

    return { success: true, message: "Atribut berhasil dihapus" };
  } catch (error) {
    console.error("Error deleting attribute item:", error);
    return { success: false, error: "Gagal menghapus atribut" };
  }
}

// =============================================
// EXPORT
// =============================================

export async function getAttributeViolationsForExport(
  period: Period = "month",
  classFilter?: string,
  customStart?: Date,
  customEnd?: Date,
) {
  const auth = await verifyKesiswaanAccess();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    const { start, end } = getDateRange(period, customStart, customEnd);

    const where: Prisma.AttributeViolationWhereInput = {
      date: { gte: start, lte: end },
    };

    if (classFilter && classFilter !== "all") {
      where.siswa = { class: classFilter };
    }

    const records = await prisma.attributeViolation.findMany({
      where,
      include: {
        siswa: { select: { name: true, nisn: true, class: true } },
        recorder: {
          select: {
            username: true,
            siswa: { select: { name: true } },
            kesiswaan: { select: { name: true } },
          },
        },
        items: { include: { attributeItem: { select: { name: true } } } },
      },
      orderBy: { date: "desc" },
    });

    return {
      success: true,
      data: records.map((r) => ({
        ...r,
        attributesLabel: r.items.map((i) => i.attributeItem.name).join(", "),
        recorder: {
          username:
            r.recorder.siswa?.name ||
            r.recorder.kesiswaan?.name ||
            r.recorder.username,
        },
      })),
    };
  } catch (error) {
    console.error("Error fetching attribute data for export:", error);
    return { success: false, error: "Gagal mengambil data export" };
  }
}

// =============================================
// SHARED (KESISWAAN)
// =============================================

export async function getAvailableClasses() {
  const auth = await verifyKesiswaanAccess();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    const classes = await prisma.siswa.findMany({
      select: { class: true },
      distinct: ["class"],
      orderBy: { class: "asc" },
      where: { class: { not: null } },
    });

    return {
      success: true,
      classes: classes.map((c) => c.class).filter(Boolean) as string[],
    };
  } catch (error) {
    console.error("Error getting classes:", error);
    return { success: false, error: "Gagal mengambil daftar kelas" };
  }
}
