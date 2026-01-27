"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  PrayerTime,
  TaskStatus,
  CarpetZone
} from "@prisma/client";

// ==========================================
// HELPERS
// ==========================================

export async function getStudentsForSelector() {
  const students = await prisma.siswa.findMany({
    where: {
      gender: "FEMALE"
    },
    select: {
      id: true,
      name: true,
      class: true,
    },
    orderBy: {
      class: "asc",
    },
  });

  return students.map(s => ({
    value: s.id,
    label: s.name || "Unnamed",
    class: s.class || "Lainnya"
  }));
}

export async function getClassesForSelector() {
    const classes = await prisma.siswa.findMany({
        select: { class: true },
        where: { class: { not: null } },
        distinct: ['class'],
        orderBy: { class: 'asc' }
    });

    return classes
        .map(c => c.class)
        .filter((c): c is string => c !== null)
        .map(c => ({ value: c, label: c }));
}

// ==========================================
// MENSTRUATION (HAID)
// ==========================================

export async function getMenstruationRecords(filter?: {
  startDate?: Date;
  endDate?: Date;
  studentId?: string;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (filter?.studentId) {
    where.siswaId = filter.studentId;
  }

  if (filter?.startDate && filter?.endDate) {
    where.startDate = {
      gte: filter.startDate,
      lte: filter.endDate
    };
  }

  const records = await prisma.worshipMenstruationRecord.findMany({
    where,
    include: {
      siswa: {
        select: { name: true, class: true }
      }
    },
    orderBy: { startDate: 'desc' }
  });

  // Calculate flags
  return records.map(record => {
    let warning = null;

    // Check duration if ended
    if (record.endDate) {
      const days = Math.floor((record.endDate.getTime() - record.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      if (days > 15) {
        warning = "Durasi haid tidak wajar (> 15 hari)";
      }
    } else {
       // Check if active too long
       const days = Math.floor((new Date().getTime() - record.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
       if (days > 15) {
        warning = "Durasi haid aktif terlalu lama (> 15 hari)";
       }
    }

    return {
      ...record,
      warning
    };
  });
}

export async function upsertMenstruationRecord(data: {
  id?: string;
  siswaId: string;
  startDate: Date;
  endDate?: Date | null;
  notes?: string;
}) {
  // Check for suspicious frequency before creating new one
  if (!data.id) {
    const lastRecord = await prisma.worshipMenstruationRecord.findFirst({
      where: { siswaId: data.siswaId },
      orderBy: { endDate: 'desc' }
    });

    if (lastRecord && lastRecord.endDate) {
       // const gap = Math.floor((data.startDate.getTime() - lastRecord.endDate.getTime()) / (1000 * 60 * 60 * 24));
       // If gap < 15 days, it's suspicious (Istihadhah usually)
       // We still allow saving but maybe add a note?
       // For now just save. The UI will flag it based on history.
    }
  }

  const record = await prisma.worshipMenstruationRecord.upsert({
    where: { id: data.id || 'new' },
    create: {
      siswaId: data.siswaId,
      startDate: data.startDate,
      endDate: data.endDate,
      notes: data.notes
    },
    update: {
      startDate: data.startDate,
      endDate: data.endDate,
      notes: data.notes
    }
  });

  revalidatePath('/dashboard-osis/religious');
  return record;
}

export async function deleteMenstruationRecord(id: string) {
    await prisma.worshipMenstruationRecord.delete({ where: { id } });
    revalidatePath('/dashboard-osis/religious');
}

// ==========================================
// ADZAN SCHEDULE
// ==========================================

export async function getAdzanSchedules(month: Date) {
  const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  return await prisma.worshipAdzanSchedule.findMany({
    where: {
      date: {
        gte: startOfMonth,
        lte: endOfMonth
      }
    },
    include: {
      siswa: {
        select: { name: true, class: true }
      }
    },
    orderBy: { date: 'asc' }
  });
}

export async function upsertAdzanSchedule(data: {
  id?: string;
  siswaId: string;
  date: Date;
  prayerTime: PrayerTime;
  status: TaskStatus;
}) {
  await prisma.worshipAdzanSchedule.upsert({
    where: { id: data.id || 'new' },
    create: {
      siswaId: data.siswaId,
      date: data.date,
      prayerTime: data.prayerTime,
      status: data.status
    },
    update: {
      siswaId: data.siswaId,
      date: data.date,
      prayerTime: data.prayerTime,
      status: data.status
    }
  });

  revalidatePath('/dashboard-osis/religious');
}

export async function deleteAdzanSchedule(id: string) {
    await prisma.worshipAdzanSchedule.delete({ where: { id } });
    revalidatePath('/dashboard-osis/religious');
}

export async function updateAdzanStatus(id: string, status: TaskStatus) {
  await prisma.worshipAdzanSchedule.update({
    where: { id },
    data: { status }
  });
  revalidatePath('/dashboard-osis/religious');
}

// ==========================================
// CARPET SCHEDULE
// ==========================================

export async function getCarpetSchedules(month: Date) {
  const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  const schedules = await prisma.worshipCarpetSchedule.findMany({
    where: {
      date: {
        gte: startOfMonth,
        lte: endOfMonth
      }
    },
    select: {
        id: true,
        date: true,
        zone: true,
        status: true,
        className: true,
        assignments: {
            include: {
                siswa: { select: { name: true, class: true } }
            }
        }
    },
    orderBy: { date: 'asc' }
  });

  return schedules;
}

export async function createCarpetSchedule(data: {
    date: Date;
    className: string;
}) {
    // Create for both zones automatically
    const zones: CarpetZone[] = [CarpetZone.FLOOR_1, CarpetZone.FLOOR_2];

    for (const zone of zones) {
        // Check if schedule exists for this date and zone
        const existing = await prisma.worshipCarpetSchedule.findFirst({
            where: {
                date: data.date,
                zone: zone
            }
        });

        if (existing) {
            // Update className
            await prisma.worshipCarpetSchedule.update({
                where: { id: existing.id },
                data: { className: data.className }
            });
        } else {
            await prisma.worshipCarpetSchedule.create({
                data: {
                    date: data.date,
                    zone: zone,
                    className: data.className
                }
            });
        }
    }

    revalidatePath('/dashboard-osis/ibadah'); // Correct path
    revalidatePath('/dashboard-osis');
}

export async function updateCarpetStatus(id: string, status: TaskStatus) {
    await prisma.worshipCarpetSchedule.update({
        where: { id },
        data: { status }
    });
    revalidatePath('/dashboard-osis/religious');
}

export async function deleteCarpetSchedule(id: string) {
    await prisma.worshipCarpetSchedule.delete({ where: { id } });
    revalidatePath('/dashboard-osis/religious');
}
