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
import { startOfDay, endOfDay } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import {
  getDateRange,
  getPeriodLabel,
  getCurrentAcademicYear,
  WIB_TIMEZONE,
  type PeriodInput,
} from "@/lib/reportPeriod";

// Periode di-re-export karena komponen laporan meng-import dari sini,
// bukan langsung dari @/lib/reportPeriod.
export type {
  Period,
  PeriodInput,
  SemesterType,
} from "@/lib/reportPeriod";

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

    const created = await prisma.attributeViolation.create({
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
      recordId: created.id,
    };
  } catch (error) {
    console.error("Error recording attribute violation:", error);
    return { success: false, error: "Gagal mencatat pelanggaran atribut" };
  }
}

/**
 * Undo an attribute-violation record the current OSIS scanner just created.
 *
 * Same "undo, not delete" scoping as lateness: caller must be the recorder and
 * the record must be within UNDO_WINDOW_MS. The linked AttributeViolationItem
 * rows are removed automatically via onDelete: Cascade.
 */
export async function deleteAttributeViolation(id: string) {
  const auth = await verifyOsisAccess();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    const record = await prisma.attributeViolation.findUnique({
      where: { id },
      select: { id: true, recordedBy: true, createdAt: true },
    });

    if (!record) {
      return {
        success: false,
        error: "Pencatatan tidak ditemukan atau sudah dibatalkan",
      };
    }

    if (record.recordedBy !== auth.user!.userId) {
      return {
        success: false,
        error: "Hanya bisa membatalkan pencatatan yang Anda buat sendiri",
      };
    }

    const UNDO_WINDOW_MS = 5 * 60 * 1000; // 5 menit
    if (Date.now() - record.createdAt.getTime() > UNDO_WINDOW_MS) {
      return {
        success: false,
        error:
          "Waktu pembatalan sudah lewat. Hubungi Kesiswaan untuk mengubah data.",
      };
    }

    await prisma.attributeViolation.delete({ where: { id } });

    revalidatePath("/dashboard-osis/keterlambatan");
    revalidatePath("/dashboard-kesiswaan/keterlambatan");

    return {
      success: true,
      message: "Pencatatan pelanggaran atribut dibatalkan",
    };
  } catch (error) {
    console.error("Error deleting attribute violation:", error);
    return { success: false, error: "Gagal membatalkan pencatatan" };
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
    // Rentang dihitung sekali per bucket; sebelumnya getDateRange dipanggil
    // dua kali untuk setiap bucket (gte dan lte).
    const dayRange = getDateRange({ period: "day" });
    const weekRange = getDateRange({ period: "week" });
    const monthRange = getDateRange({ period: "month" });
    const yearRange = getDateRange({ period: "year" });

    const [dayCount, weekCount, monthCount, yearCount] = await Promise.all([
      prisma.attributeViolation.count({
        where: { date: { gte: dayRange.start, lte: dayRange.end } },
      }),
      prisma.attributeViolation.count({
        where: { date: { gte: weekRange.start, lte: weekRange.end } },
      }),
      prisma.attributeViolation.count({
        where: { date: { gte: monthRange.start, lte: monthRange.end } },
      }),
      prisma.attributeViolation.count({
        where: { date: { gte: yearRange.start, lte: yearRange.end } },
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

/**
 * Menerima PeriodInput utuh, bukan (period, customStart, customEnd)
 * terpisah: kalau pemanggil menghitung rentangnya sendiri lalu
 * mengirimkannya sebagai custom range, toZonedTime akan dijalankan dua
 * kali pada tanggal yang sama dan batas rentang melenceng 7 jam per
 * konversi.
 */
export async function getAttributeViolations(params: {
  periodInput: PeriodInput;
  classFilter?: string;
  page?: number;
  limit?: number;
  search?: string;
}) {
  const auth = await verifyKesiswaanAccess();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  const { periodInput, classFilter, page = 1, limit = 20, search } = params;

  try {
    const { start, end } = getDateRange(periodInput);
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

export async function getAttributeViolationsByClass(params: {
  periodInput: PeriodInput;
}) {
  const auth = await verifyKesiswaanAccess();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    const { start, end } = getDateRange(params.periodInput);

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

export async function getAttributeViolationTrend(params: {
  periodInput: PeriodInput;
}) {
  const auth = await verifyKesiswaanAccess();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    const { start, end } = getDateRange(params.periodInput);

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

export async function getMostViolatedAttributes(params: {
  periodInput: PeriodInput;
}) {
  const auth = await verifyKesiswaanAccess();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    const { start, end } = getDateRange(params.periodInput);

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
// EXPORT (KESISWAAN)
// =============================================

export interface AttributeDetailRow {
  date: Date;
  siswaName: string | null;
  nisn: string;
  class: string | null;
  time: string;
  attributesLabel: string;
  notes: string | null;
  recordedBy: string;
  /** Poin seumur hidup siswa ybs — melekat pada siswa, bukan kejadian. */
  totalPoints: number;
}

export interface AttributeRecapRow {
  siswaId: string;
  name: string | null;
  nisn: string;
  class: string | null;
  periodCount: number;
  periodPoints: number;
  totalCount: number;
  totalPoints: number;
  /** Atribut tersering dalam periode terpilih. */
  topAttribute: string;
}

export interface ReportSummary {
  periodLabel: string;
  classLabel: string;
  totalRecords: number;
  totalStudents: number;
  averagePerStudent: number;
  topClass: string;
  threshold: number;
  pointsPerThreshold: number;
}

/**
 * Data lengkap untuk export tiga sheet: Detail, Rekap Siswa, Ringkasan.
 *
 * Menggantikan getAttributeViolationsForExport() yang hanya mengembalikan
 * baris kejadian dan mengabaikan kotak pencarian — sehingga isi berkas
 * tidak cocok dengan yang terlihat di layar.
 */
export async function getAttributeReportForExport(params: {
  periodInput: PeriodInput;
  classFilter?: string;
  search?: string;
}) {
  const auth = await verifyKesiswaanAccess();
  if (!auth.authorized) {
    return { success: false as const, error: auth.error! };
  }

  const { periodInput, classFilter, search } = params;

  try {
    const { start, end } = getDateRange(periodInput);
    const { threshold, pointsPerThreshold } = await getAttributePointConfig();

    // Predikat sama persis dengan getAttributeViolations agar isi export
    // cocok dengan yang terlihat di layar.
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

    const [records, grouped] = await Promise.all([
      prisma.attributeViolation.findMany({
        where,
        include: {
          siswa: { select: { id: true, name: true, nisn: true, class: true } },
          recorder: {
            select: {
              username: true,
              siswa: { select: { name: true } },
              kesiswaan: { select: { name: true } },
            },
          },
          items: {
            include: {
              attributeItem: { select: { name: true, order: true } },
            },
          },
        },
        orderBy: { date: "desc" },
      }),
      prisma.attributeViolation.groupBy({
        by: ["siswaId"],
        where,
        _count: { _all: true },
      }),
    ]);

    const siswaIds = grouped.map((g) => g.siswaId);

    // Jumlah seumur hidup: sengaja TANPA filter periode/kelas.
    const students =
      siswaIds.length > 0
        ? await prisma.siswa.findMany({
            where: { id: { in: siswaIds } },
            select: {
              id: true,
              name: true,
              nisn: true,
              class: true,
              _count: { select: { attributeViolations: true } },
            },
          })
        : [];

    // Atribut tersering per siswa, dihitung dari records yang sudah
    // ter-fetch untuk sheet Detail — tanpa query tambahan. Seri diputus
    // oleh AttributeItem.order terkecil supaya stabil antar export.
    const attrTally = new Map<string, Map<string, { count: number; order: number }>>();
    records.forEach((r) => {
      const tally =
        attrTally.get(r.siswa.id) ??
        new Map<string, { count: number; order: number }>();
      r.items.forEach((i) => {
        const name = i.attributeItem.name;
        tally.set(name, {
          count: (tally.get(name)?.count ?? 0) + 1,
          order: i.attributeItem.order,
        });
      });
      attrTally.set(r.siswa.id, tally);
    });

    const topAttributeFor = (siswaId: string): string => {
      const tally = attrTally.get(siswaId);
      if (!tally || tally.size === 0) return "-";
      return [...tally.entries()].sort(
        ([, a], [, b]) => b.count - a.count || a.order - b.order,
      )[0][0];
    };

    const periodCountById = new Map(
      grouped.map((g) => [g.siswaId, g._count._all]),
    );

    const recap: AttributeRecapRow[] = students
      .map((s) => {
        const periodCount = periodCountById.get(s.id) ?? 0;
        const totalCount = s._count.attributeViolations;
        return {
          siswaId: s.id,
          name: s.name,
          nisn: s.nisn,
          class: s.class,
          periodCount,
          periodPoints: calculateAttributePoints(
            periodCount,
            threshold,
            pointsPerThreshold,
          ),
          totalCount,
          totalPoints: calculateAttributePoints(
            totalCount,
            threshold,
            pointsPerThreshold,
          ),
          topAttribute: topAttributeFor(s.id),
        };
      })
      // Urutan stabil: poin, lalu jumlah, lalu nama.
      .sort(
        (a, b) =>
          b.totalPoints - a.totalPoints ||
          b.totalCount - a.totalCount ||
          (a.name || "").localeCompare(b.name || ""),
      );

    const totalPointsById = new Map(
      recap.map((r) => [r.siswaId, r.totalPoints]),
    );

    const detail: AttributeDetailRow[] = records.map((r) => ({
      date: r.date,
      siswaName: r.siswa.name,
      nisn: r.siswa.nisn,
      class: r.siswa.class,
      time: r.scanTime,
      attributesLabel: r.items.map((i) => i.attributeItem.name).join(", "),
      notes: r.notes,
      recordedBy:
        r.recorder.siswa?.name ||
        r.recorder.kesiswaan?.name ||
        r.recorder.username,
      totalPoints: totalPointsById.get(r.siswa.id) ?? 0,
    }));

    const byClass: Record<string, number> = {};
    records.forEach((r) => {
      const cls = r.siswa.class || "Tanpa Kelas";
      byClass[cls] = (byClass[cls] || 0) + 1;
    });
    const topClass =
      Object.entries(byClass).sort(([, a], [, b]) => b - a)[0]?.[0] || "-";

    const summary: ReportSummary = {
      periodLabel: getPeriodLabel(periodInput),
      classLabel:
        classFilter && classFilter !== "all" ? classFilter : "Semua Kelas",
      totalRecords: records.length,
      totalStudents: recap.length,
      averagePerStudent:
        recap.length > 0
          ? Number((records.length / recap.length).toFixed(1))
          : 0,
      topClass,
      threshold,
      pointsPerThreshold,
    };

    return { success: true as const, detail, recap, summary };
  } catch (error) {
    console.error("Error building attribute report:", error);
    return { success: false as const, error: "Gagal mengambil data export" };
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

/**
 * Daftar tahun ajaran yang punya data pelanggaran atribut, dari record
 * terlama sampai tahun ajaran berjalan.
 */
export async function getAvailableAcademicYears() {
  const auth = await verifyKesiswaanAccess();
  if (!auth.authorized) {
    return { success: false, error: auth.error, years: [] as number[] };
  }

  try {
    const oldest = await prisma.attributeViolation.aggregate({
      _min: { date: true },
    });

    const current = getCurrentAcademicYear();
    const earliest = oldest._min.date
      ? getCurrentAcademicYear(oldest._min.date)
      : current;

    const years: number[] = [];
    for (let y = current; y >= earliest; y--) {
      years.push(y);
    }

    return { success: true, years };
  } catch (error) {
    console.error("Error getting academic years:", error);
    return {
      success: false,
      error: "Gagal mengambil tahun ajaran",
      years: [] as number[],
    };
  }
}
