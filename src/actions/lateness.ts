"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getAuthenticatedUser } from "@/lib/auth";
import { hasOsisAccess, isRoleMatch, isSiswaRole } from "@/lib/roles";
import {
  generateQRToken,
  generateQRPayload,
  validateQRScan,
  formatTimeWIB,
} from "@/lib/qr-token";
import { updateSettings } from "@/lib/siteSettings";
import {
  getLatenessPointConfig,
  calculateLatenessPoints,
} from "@/lib/latenessPoints";
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
import { getScanWindowError, getScanWindowStatus } from "@/lib/scan-window";
import { verifyScanOverrideToken } from "@/lib/scan-override";

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

async function verifyLatenessWindow(
  userId: string,
  overrideToken?: string,
) {
  const status = getScanWindowStatus("lateness");
  if (status.isOpen) return { allowed: true, status };

  const overrideValid = await verifyScanOverrideToken(overrideToken, {
    osisUserId: userId,
    mode: "lateness",
  });

  return {
    allowed: overrideValid,
    status,
    error: overrideValid ? undefined : getScanWindowError(status),
  };
}

// =============================================
// QR TOKEN MANAGEMENT
// =============================================

/**
 * Generate/regenerate QR token for a student
 * Called when needed (auto-generated on first scan attempt or manually)
 */
export async function generateStudentQRToken(siswaId: string) {
  const auth = await verifyKesiswaanAccess();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    const token = generateQRToken(siswaId);

    await prisma.siswa.update({
      where: { id: siswaId },
      data: { qrToken: token },
    });

    return { success: true, token };
  } catch (error) {
    console.error("Error generating QR token:", error);
    return { success: false, error: "Gagal membuat QR token" };
  }
}

/**
 * Get QR code data for a student (for display in student dashboard)
 */
export async function getStudentQRCode(siswaId: string) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const siswa = await prisma.siswa.findUnique({
      where: { id: siswaId },
      select: { id: true, qrToken: true, name: true, nisn: true },
    });

    if (!siswa) {
      return { success: false, error: "Siswa tidak ditemukan" };
    }

    // Generate token if not exists
    let token = siswa.qrToken;
    if (!token) {
      token = generateQRToken(siswa.id);
      await prisma.siswa.update({
        where: { id: siswa.id },
        data: { qrToken: token },
      });
    }

    const qrPayload = generateQRPayload(siswa.id, token);

    return {
      success: true,
      qrData: qrPayload,
      student: { name: siswa.name, nisn: siswa.nisn },
    };
  } catch (error) {
    console.error("Error getting QR code:", error);
    return { success: false, error: "Gagal mengambil QR code" };
  }
}

// =============================================
// LATENESS RECORDING (OSIS)
// =============================================

/**
 * Verify a scanned QR code and return student info
 */
export async function verifyScanQR(qrData: string, overrideToken?: string) {
  const auth = await verifyOsisAccess();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  const windowAccess = await verifyLatenessWindow(
    auth.user!.userId,
    overrideToken,
  );
  if (!windowAccess.allowed) {
    return { success: false, error: windowAccess.error };
  }

  try {
    const siswaId = validateQRScan(qrData);
    if (!siswaId) {
      return { success: false, error: "QR Code tidak valid" };
    }

    // Verify token matches database
    const siswa = await prisma.siswa.findUnique({
      where: { id: siswaId },
      include: {
        user: { select: { username: true } },
      },
    });

    if (!siswa) {
      return { success: false, error: "Siswa tidak ditemukan" };
    }

    // Check if already recorded today
    const today = new Date();
    const startOfToday = startOfDay(toZonedTime(today, WIB_TIMEZONE));
    const endOfToday = endOfDay(toZonedTime(today, WIB_TIMEZONE));

    const existingRecord = await prisma.latenessRecord.findFirst({
      where: {
        siswaId: siswa.id,
        date: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
    });

    if (existingRecord) {
      return {
        success: false,
        error: "Siswa sudah tercatat terlambat hari ini",
        alreadyRecorded: true,
        student: {
          id: siswa.id,
          name: siswa.name,
          nisn: siswa.nisn,
          class: siswa.class,
        },
      };
    }

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
    };
  } catch (error) {
    console.error("Error verifying QR:", error);
    return { success: false, error: "Gagal memverifikasi QR" };
  }
}

/**
 * Record student lateness after successful QR scan
 */
export async function recordLateness(
  siswaId: string,
  arrivalTime: string,
  reason?: string,
  overrideToken?: string,
) {
  const auth = await verifyOsisAccess();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  const windowAccess = await verifyLatenessWindow(
    auth.user!.userId,
    overrideToken,
  );
  if (!windowAccess.allowed) {
    return { success: false, error: windowAccess.error };
  }

  try {
    // Validate siswa exists
    const siswa = await prisma.siswa.findUnique({
      where: { id: siswaId },
      select: { id: true, name: true },
    });

    if (!siswa) {
      return { success: false, error: "Siswa tidak ditemukan" };
    }

    // Check for duplicate today
    const today = new Date();
    const startOfToday = startOfDay(toZonedTime(today, WIB_TIMEZONE));
    const endOfToday = endOfDay(toZonedTime(today, WIB_TIMEZONE));

    const existingRecord = await prisma.latenessRecord.findFirst({
      where: {
        siswaId,
        date: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
    });

    if (existingRecord) {
      return {
        success: false,
        error: "Siswa sudah tercatat terlambat hari ini",
      };
    }

    // Create record
    const created = await prisma.latenessRecord.create({
      data: {
        siswaId,
        arrivalTime,
        reason: reason || null,
        recordedBy: auth.user!.userId,
      },
    });

    revalidatePath("/dashboard-osis/keterlambatan");
    revalidatePath("/dashboard-kesiswaan/keterlambatan");

    return {
      success: true,
      message: `Keterlambatan ${siswa.name} berhasil dicatat`,
      recordId: created.id,
    };
  } catch (error) {
    console.error("Error recording lateness:", error);
    return { success: false, error: "Gagal mencatat keterlambatan" };
  }
}

/**
 * Undo a lateness record the current OSIS scanner just created.
 *
 * Scoped deliberately so this stays an "undo", not a delete privilege:
 * the caller must be the OSIS member who recorded it (`recordedBy`), and the
 * record must be newer than UNDO_WINDOW_MS. Lasting edits belong to Kesiswaan.
 * The client only surfaces this right after a scan, but we re-check here so a
 * crafted request cannot remove someone else's or an older record.
 */
export async function deleteLatenessRecord(id: string) {
  const auth = await verifyOsisAccess();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    const record = await prisma.latenessRecord.findUnique({
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

    await prisma.latenessRecord.delete({ where: { id } });

    revalidatePath("/dashboard-osis/keterlambatan");
    revalidatePath("/dashboard-kesiswaan/keterlambatan");

    return { success: true, message: "Pencatatan keterlambatan dibatalkan" };
  } catch (error) {
    console.error("Error deleting lateness record:", error);
    return { success: false, error: "Gagal membatalkan pencatatan" };
  }
}

// =============================================
// LATENESS REPORTS (KESISWAAN)
// =============================================

/**
 * Get lateness statistics for dashboard (Overview cards)
 * Now supports filtering by specific range if needed, or defaults to standard buckets
 */
export async function getLatenessStats() {
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
      prisma.latenessRecord.count({
        where: { date: { gte: dayRange.start, lte: dayRange.end } },
      }),
      prisma.latenessRecord.count({
        where: { date: { gte: weekRange.start, lte: weekRange.end } },
      }),
      prisma.latenessRecord.count({
        where: { date: { gte: monthRange.start, lte: monthRange.end } },
      }),
      prisma.latenessRecord.count({
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
    console.error("Error getting lateness stats:", error);
    return { success: false, error: "Gagal mengambil statistik" };
  }
}

/**
 * Get lateness records with filters.
 *
 * Menerima PeriodInput utuh, bukan (period, customStart, customEnd)
 * terpisah: kalau pemanggil menghitung rentangnya sendiri lalu
 * mengirimkannya sebagai custom range, toZonedTime akan dijalankan dua
 * kali pada tanggal yang sama dan batas rentang melenceng 7 jam per
 * konversi.
 */
export async function getLatenessRecords(params: {
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

    const where: Prisma.LatenessRecordWhereInput = {
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
      prisma.latenessRecord.findMany({
        where,
        include: {
          siswa: {
            select: { name: true, nisn: true, class: true, image: true },
          },
          recorder: {
            select: {
              username: true,
              siswa: {
                select: { name: true },
              },
              kesiswaan: {
                select: { name: true },
              },
            },
          },
        },
        orderBy: { date: "desc" },
        skip,
        take: limit,
      }),
      prisma.latenessRecord.count({ where }),
    ]);

    return {
      success: true,
      records: records.map((r) => ({
        id: r.id,
        siswaName: r.siswa.name,
        nisn: r.siswa.nisn,
        class: r.siswa.class,
        arrivalTime: r.arrivalTime,
        date: r.date,
        reason: r.reason,
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
    console.error("Error getting lateness records:", error);
    return { success: false, error: "Gagal mengambil data keterlambatan" };
  }
}

/**
 * Get lateness by class for chart
 */
export async function getLatenessByClass(params: {
  periodInput: PeriodInput;
}) {
  const auth = await verifyKesiswaanAccess();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    const { start, end } = getDateRange(params.periodInput);

    const records = await prisma.latenessRecord.findMany({
      where: { date: { gte: start, lte: end } },
      include: { siswa: { select: { class: true } } },
    });

    // Group by class
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
    console.error("Error getting lateness by class:", error);
    return { success: false, error: "Gagal mengambil data per kelas" };
  }
}

/**
 * Get lateness trend for chart
 */
export async function getLatenesTrend(params: { periodInput: PeriodInput }) {
  const auth = await verifyKesiswaanAccess();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    const { start, end } = getDateRange(params.periodInput);

    const records = await prisma.latenessRecord.findMany({
      where: { date: { gte: start, lte: end } },
      select: { date: true },
      orderBy: { date: "asc" },
    });

    // Group by date
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
    console.error("Error getting lateness trend:", error);
    return { success: false, error: "Gagal mengambil trend data" };
  }
}

// =============================================
// LATENESS POINT SYSTEM (KESISWAAN)
// =============================================

/**
 * Get current lateness point settings (threshold + points awarded).
 */
export async function getLatenessPointSettings() {
  const auth = await verifyKesiswaanAccess();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    const config = await getLatenessPointConfig();
    return { success: true, data: config };
  } catch (error) {
    console.error("Error getting lateness point settings:", error);
    return {
      success: false,
      error: "Gagal mengambil pengaturan poin keterlambatan",
    };
  }
}

/**
 * Update lateness point settings (threshold + points awarded per threshold).
 */
export async function updateLatenessPointSettings(
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
      error: "Jumlah akumulasi keterlambatan minimal 1",
    };
  }

  if (!Number.isFinite(pointsPerThreshold) || pointsPerThreshold < 0) {
    return { success: false, error: "Jumlah poin tidak boleh negatif" };
  }

  try {
    await updateSettings({
      "lateness.pointThreshold": String(Math.trunc(threshold)),
      "lateness.pointsPerThreshold": String(Math.trunc(pointsPerThreshold)),
    });

    revalidatePath("/dashboard-kesiswaan/settings");
    revalidatePath("/dashboard-kesiswaan/keterlambatan");
    revalidatePath("/dashboard-kesiswaan/siswa");

    return {
      success: true,
      message: "Pengaturan poin keterlambatan berhasil disimpan",
    };
  } catch (error) {
    console.error("Error updating lateness point settings:", error);
    return {
      success: false,
      error: "Gagal menyimpan pengaturan poin keterlambatan",
    };
  }
}

/**
 * Get per-student lateness point summary (lifetime accumulation, not
 * affected by any period filter). Only students with at least 1 point are
 * returned, sorted by points/lateness count descending.
 */
export async function getLatenessPointsSummary(
  classFilter?: string,
  search?: string,
) {
  const auth = await verifyKesiswaanAccess();
  if (!auth.authorized) {
    return { success: false, error: auth.error, data: [] };
  }

  try {
    const { threshold, pointsPerThreshold } = await getLatenessPointConfig();

    const where: Prisma.SiswaWhereInput = {
      latenessRecords: { some: {} },
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
        _count: { select: { latenessRecords: true } },
      },
    });

    const data = students
      .map((s) => ({
        siswaId: s.id,
        name: s.name,
        nisn: s.nisn,
        class: s.class,
        totalLate: s._count.latenessRecords,
        points: calculateLatenessPoints(
          s._count.latenessRecords,
          threshold,
          pointsPerThreshold,
        ),
      }))
      .filter((s) => s.points > 0)
      .sort((a, b) => b.points - a.points || b.totalLate - a.totalLate);

    return {
      success: true,
      data,
      config: { threshold, pointsPerThreshold },
    };
  } catch (error) {
    console.error("Error getting lateness points summary:", error);
    return {
      success: false,
      error: "Gagal mengambil data poin keterlambatan",
      data: [],
    };
  }
}

// =============================================
// LATENESS POINTS (STUDENT SELF-VIEW)
// =============================================

/**
 * Get the authenticated student's own lifetime lateness count & points.
 * Deliberately does not accept a siswaId param — always resolves the
 * student from the authenticated session so a student can never query
 * another student's data.
 */
export async function getMyLatenessPoints() {
  const user = await getAuthenticatedUser();
  if (!user || !isSiswaRole(user.role)) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const siswa = await prisma.siswa.findUnique({
      where: { userId: user.userId },
      select: {
        _count: { select: { latenessRecords: true } },
      },
    });

    if (!siswa) {
      return { success: false, error: "Data siswa tidak ditemukan" };
    }

    const { threshold, pointsPerThreshold } = await getLatenessPointConfig();
    const totalLate = siswa._count.latenessRecords;
    const points = calculateLatenessPoints(
      totalLate,
      threshold,
      pointsPerThreshold,
    );

    return {
      success: true,
      data: { totalLate, points, threshold, pointsPerThreshold },
    };
  } catch (error) {
    console.error("Error getting student lateness points:", error);
    return { success: false, error: "Gagal mengambil data poin keterlambatan" };
  }
}

/**
 * Get available classes for filtering
 */
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
 * Daftar tahun ajaran yang punya data, dari record terlama sampai tahun
 * ajaran berjalan. Satu query agregat ringan pada kolom terindeks.
 */
export async function getAvailableAcademicYears() {
  const auth = await verifyKesiswaanAccess();
  if (!auth.authorized) {
    return { success: false, error: auth.error, years: [] as number[] };
  }

  try {
    const oldest = await prisma.latenessRecord.aggregate({
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

// =============================================
// EXPORT (KESISWAAN)
// =============================================

export interface ReportDetailRow {
  date: Date;
  siswaName: string | null;
  nisn: string;
  class: string | null;
  time: string;
  reason: string | null;
  recordedBy: string;
  /** Poin seumur hidup siswa ybs — melekat pada siswa, bukan kejadian. */
  totalPoints: number;
}

export interface ReportRecapRow {
  siswaId: string;
  name: string | null;
  nisn: string;
  class: string | null;
  periodCount: number;
  periodPoints: number;
  totalCount: number;
  totalPoints: number;
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
 * Menggantikan getLatenessForExport() yang hanya mengembalikan baris
 * kejadian dan mengabaikan kotak pencarian — sehingga isi berkas tidak
 * cocok dengan yang terlihat di layar.
 *
 * Tiga query agregat, bukan N+1: detail, groupBy per siswa untuk hitungan
 * periode, dan satu findMany untuk identitas + hitungan seumur hidup.
 */
export async function getLatenessReportForExport(params: {
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
    const { threshold, pointsPerThreshold } = await getLatenessPointConfig();

    // Predikat sama persis dengan getLatenessRecords agar isi export
    // cocok dengan yang terlihat di layar.
    const where: Prisma.LatenessRecordWhereInput = {
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
      prisma.latenessRecord.findMany({
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
        },
        orderBy: { date: "desc" },
      }),
      prisma.latenessRecord.groupBy({
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
              _count: { select: { latenessRecords: true } },
            },
          })
        : [];

    const periodCountById = new Map(
      grouped.map((g) => [g.siswaId, g._count._all]),
    );

    const recap: ReportRecapRow[] = students
      .map((s) => {
        const periodCount = periodCountById.get(s.id) ?? 0;
        const totalCount = s._count.latenessRecords;
        return {
          siswaId: s.id,
          name: s.name,
          nisn: s.nisn,
          class: s.class,
          periodCount,
          periodPoints: calculateLatenessPoints(
            periodCount,
            threshold,
            pointsPerThreshold,
          ),
          totalCount,
          totalPoints: calculateLatenessPoints(
            totalCount,
            threshold,
            pointsPerThreshold,
          ),
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

    const detail: ReportDetailRow[] = records.map((r) => ({
      date: r.date,
      siswaName: r.siswa.name,
      nisn: r.siswa.nisn,
      class: r.siswa.class,
      time: r.arrivalTime,
      reason: r.reason,
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
    console.error("Error building lateness report:", error);
    return { success: false as const, error: "Gagal mengambil data export" };
  }
}
