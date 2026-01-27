"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getAuthenticatedUser } from "@/lib/auth";
import { hasOsisAccess, isRoleMatch } from "@/lib/roles";
import {
  generateQRToken,
  generateQRPayload,
  validateQRScan,
  formatTimeWIB,
} from "@/lib/qr-token";
import { revalidatePath } from "next/cache";
import { startOfDay, startOfWeek, startOfMonth, startOfYear, endOfDay } from "date-fns";
import { toZonedTime } from "date-fns-tz";

// WIB Timezone for date calculations
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
export async function verifyScanQR(qrData: string) {
  const auth = await verifyOsisAccess();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
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
  reason?: string
) {
  const auth = await verifyOsisAccess();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
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
      return { success: false, error: "Siswa sudah tercatat terlambat hari ini" };
    }

    // Create record
    await prisma.latenessRecord.create({
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
    };
  } catch (error) {
    console.error("Error recording lateness:", error);
    return { success: false, error: "Gagal mencatat keterlambatan" };
  }
}

// =============================================
// LATENESS REPORTS (KESISWAAN)
// =============================================

// ... (imports remain the same)

// WIB Timezone for date calculations
// const WIB_TIMEZONE = "Asia/Jakarta"; // Removed duplicate

export type Period = "day" | "week" | "month" | "year" | "custom";

// Helper to get date range
function getDateRange(period: Period, customStart?: Date, customEnd?: Date) {
  const now = new Date();
  const zonedNow = toZonedTime(now, WIB_TIMEZONE);

  if (period === "custom" && customStart && customEnd) {
    return { 
      start: startOfDay(toZonedTime(customStart, WIB_TIMEZONE)), 
      end: endOfDay(toZonedTime(customEnd, WIB_TIMEZONE)) 
    };
  }

  switch (period) {
    case "day":
      return { start: startOfDay(zonedNow), end: endOfDay(zonedNow) };
    case "week":
      return { start: startOfWeek(zonedNow, { weekStartsOn: 1 }), end: endOfDay(zonedNow) };
    case "month":
      return { start: startOfMonth(zonedNow), end: endOfDay(zonedNow) };
    case "year":
      return { start: startOfYear(zonedNow), end: endOfDay(zonedNow) };
    default:
      return { start: startOfDay(zonedNow), end: endOfDay(zonedNow) };
  }
}

// ... (existing verifyOsisAccess, verifyKesiswaanAccess, qr management functions remain same - lines 23-120)

// ... (existing verifyScanQR, recordLateness functions remain same - lines 125-262)

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
    const [dayCount, weekCount, monthCount, yearCount] = await Promise.all([
      prisma.latenessRecord.count({
        where: { date: { gte: getDateRange("day").start, lte: getDateRange("day").end } },
      }),
      prisma.latenessRecord.count({
        where: { date: { gte: getDateRange("week").start, lte: getDateRange("week").end } },
      }),
      prisma.latenessRecord.count({
        where: { date: { gte: getDateRange("month").start, lte: getDateRange("month").end } },
      }),
      prisma.latenessRecord.count({
        where: { date: { gte: getDateRange("year").start, lte: getDateRange("year").end } },
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
 * Get lateness records with filters (supports custom range)
 */
export async function getLatenessRecords(
  period: Period = "day",
  classFilter?: string,
  page: number = 1,
  limit: number = 20,
  customStart?: Date,
  customEnd?: Date,
  search?: string
) {
  const auth = await verifyKesiswaanAccess();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    const { start, end } = getDateRange(period, customStart, customEnd);
    const skip = (page - 1) * limit;

    const where: Prisma.LatenessRecordWhereInput = {
      date: { gte: start, lte: end },
    };

    if (classFilter && classFilter !== "all") {
      where.siswa = { class: classFilter };
    }

    if (search) {
      where.OR = [
        { siswa: { name: { contains: search, mode: 'insensitive' } } },
        { siswa: { nisn: { contains: search } } }
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
            select: { username: true },
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
        recordedBy: r.recorder.username,
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
export async function getLatenessByClass(
  period: Period = "month", 
  customStart?: Date, 
  customEnd?: Date
) {
  const auth = await verifyKesiswaanAccess();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    const { start, end } = getDateRange(period, customStart, customEnd);

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
export async function getLatenesTrend(
  period: Period = "month",
  customStart?: Date,
  customEnd?: Date
) {
  const auth = await verifyKesiswaanAccess();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    const { start, end } = getDateRange(period, customStart, customEnd);

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
 * Get raw lateness data for Excel export
 */
export async function getLatenessForExport(
  period: Period = "month",
  classFilter?: string,
  customStart?: Date,
  customEnd?: Date
) {
  const auth = await verifyKesiswaanAccess();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    const { start, end } = getDateRange(period, customStart, customEnd);

    const where: Prisma.LatenessRecordWhereInput = {
      date: { gte: start, lte: end },
    };

    if (classFilter && classFilter !== "all") {
      where.siswa = { class: classFilter };
    }

    const records = await prisma.latenessRecord.findMany({
      where,
      include: {
        siswa: {
          select: {
            name: true,
            nisn: true,
            class: true,
          },
        },
        recorder: {
          select: { username: true },
        },
      },
      orderBy: { date: "desc" },
    });

    return { success: true, data: records };
  } catch (error) {
    console.error("Error fetching data for export:", error);
    return { success: false, error: "Gagal mengambil data export" };
  }
}

/**
 * Export lateness records as CSV string
 * @deprecated Use client-side Excel export with getLatenessForExport instead
 */
export async function exportLatenessCSV(
  period: Period = "month",
  classFilter?: string,
  customStart?: Date,
  customEnd?: Date
) {
  const auth = await verifyKesiswaanAccess();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    const { start, end } = getDateRange(period, customStart, customEnd);

    const where: Prisma.LatenessRecordWhereInput = {
      date: { gte: start, lte: end },
    };

    if (classFilter && classFilter !== "all") {
      where.siswa = { class: classFilter };
    }

    const records = await prisma.latenessRecord.findMany({
      where,
      include: {
        siswa: {
          select: {
            name: true,
            nisn: true,
            class: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    // Generate CSV
    const headers = ["Tanggal", "Nama", "NISN", "Kelas", "Jam Tiba", "Alasan", "Dicatat Oleh"];
    const rows = records.map((r) => [
      new Date(r.date).toLocaleDateString("id-ID"),
      r.siswa.name || "-",
      r.siswa.nisn,
      r.siswa.class || "-",
      r.arrivalTime,
      r.reason || "-",
      r.recordedBy,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    return { success: true, csv };
  } catch (error) {
    console.error("Error exporting CSV:", error);
    return { success: false, error: "Gagal export CSV" };
  }
}

