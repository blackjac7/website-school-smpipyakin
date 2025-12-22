'use server';

import { prisma } from '@/lib/prisma';
import { StatusApproval, Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// =============================================
// VALIDATION & CONTENT MANAGEMENT
// =============================================

export interface ValidationItem {
  id: string;
  type: 'achievement' | 'work';
  title: string;
  description: string | null;
  authorName: string;
  authorClass: string | null;
  date: Date;
  status: StatusApproval;
  category: string | null;
  image?: string | null;
  videoLink?: string | null;
  rejectionNote?: string | null;
}

export async function getValidationQueue(
  statusFilter: StatusApproval | 'ALL' = 'PENDING'
): Promise<ValidationItem[]> {
  try {
    const whereClause: Prisma.StudentAchievementWhereInput & Prisma.StudentWorkWhereInput = {};
    if (statusFilter !== 'ALL') {
      whereClause.statusPersetujuan = statusFilter;
    }

    // Fetch Achievements
    const achievements = await prisma.studentAchievement.findMany({
      where: whereClause,
      include: {
        siswa: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Fetch Works
    const works = await prisma.studentWork.findMany({
      where: whereClause,
      include: {
        siswa: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Normalize and merge
    const normalizedAchievements: ValidationItem[] = achievements.map((a) => ({
      id: a.id,
      type: 'achievement',
      title: a.title,
      description: a.description,
      authorName: a.siswa.name || 'Unknown',
      authorClass: a.siswa.class,
      date: a.createdAt,
      status: a.statusPersetujuan,
      category: a.category,
      image: a.image,
    }));

    const normalizedWorks: ValidationItem[] = works.map((w) => ({
      id: w.id,
      type: 'work',
      title: w.title,
      description: w.description,
      authorName: w.siswa.name || 'Unknown',
      authorClass: w.siswa.class,
      date: w.createdAt,
      status: w.statusPersetujuan,
      category: w.workType === 'PHOTO' ? 'Fotografi' : 'Videografi',
      image: w.mediaUrl,
      videoLink: w.videoLink,
      rejectionNote: w.rejectionNote,
    }));

    // Combine and sort by date descending
    return [...normalizedAchievements, ...normalizedWorks].sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );
  } catch (error) {
    console.error('Error fetching validation queue:', error);
    return [];
  }
}

export async function validateContent(
  id: string,
  type: 'achievement' | 'work',
  action: 'APPROVE' | 'REJECT',
  note?: string
) {
  try {
    const status = action === 'APPROVE' ? StatusApproval.APPROVED : StatusApproval.REJECTED;

    if (type === 'achievement') {
      await prisma.studentAchievement.update({
        where: { id },
        data: {
          statusPersetujuan: status,
        },
      });
    } else {
      await prisma.studentWork.update({
        where: { id },
        data: {
          statusPersetujuan: status,
          rejectionNote: note,
        },
      });
    }

    revalidatePath('/dashboard-kesiswaan');
    return { success: true };
  } catch (error) {
    console.error('Error validating content:', error);
    return { success: false, error: 'Failed to update status' };
  }
}

// =============================================
// STUDENT DATA MANAGEMENT
// =============================================

export async function getStudents(search?: string) {
  try {
    const where: Prisma.SiswaWhereInput = search
      ? {
          OR: [
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { name: { contains: search, mode: 'insensitive' } as any },
            { nisn: { contains: search } },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { class: { contains: search, mode: 'insensitive' } as any },
          ],
        }
      : {};

    const students = await prisma.siswa.findMany({
      where,
      orderBy: { name: 'asc' },
      take: 50, // Limit for performance
    });

    return students;
  } catch (error) {
    console.error('Error fetching students:', error);
    return [];
  }
}

// =============================================
// DASHBOARD STATS
// =============================================

export interface DashboardStats {
  monthly: Array<{
    month: string;
    validated: number;
    pending: number;
    rejected: number;
  }>;
  byCategory: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  byStatus: Array<{
    status: string;
    count: number;
    color: string;
  }>;
  summary: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  // Parallel fetch for basic stats
  const [achievements, works] = await Promise.all([
    prisma.studentAchievement.findMany(),
    prisma.studentWork.findMany(),
  ]);

  const allItems = [
    ...achievements.map((a) => ({ ...a, type: 'achievement' })),
    ...works.map((w) => ({ ...w, type: 'work' })),
  ];

  // Calculate summary
  const pending = allItems.filter((i) => i.statusPersetujuan === 'PENDING').length;
  const approved = allItems.filter((i) => i.statusPersetujuan === 'APPROVED').length;
  const rejected = allItems.filter((i) => i.statusPersetujuan === 'REJECTED').length;

  // Calculate By Status
  const byStatus = [
    { status: 'Disetujui', count: approved, color: 'bg-green-500' },
    { status: 'Pending', count: pending, color: 'bg-yellow-500' },
    { status: 'Ditolak', count: rejected, color: 'bg-red-500' },
  ];

  // Calculate By Category (simplified)
  const achievementCount = achievements.length;
  const workCount = works.length;
  const total = allItems.length;

  const byCategory = [
    {
      category: 'Prestasi Siswa',
      count: achievementCount,
      percentage: total > 0 ? (achievementCount / total) * 100 : 0,
    },
    {
      category: 'Karya Siswa',
      count: workCount,
      percentage: total > 0 ? (workCount / total) * 100 : 0,
    },
  ];

  // Calculate Monthly (Mock for now or real aggregation if needed)
  // For simplicity and performance, we'll group the last 6 months in code
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const currentMonth = new Date().getMonth();
  const monthlyStats = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(currentMonth - i);
    const mIndex = d.getMonth();

    // Count items created in this month
    const itemsInMonth = allItems.filter(item => {
      const itemDate = new Date(item.createdAt);
      return itemDate.getMonth() === mIndex && itemDate.getFullYear() === d.getFullYear();
    });

    monthlyStats.push({
      month: months[mIndex],
      validated: itemsInMonth.filter(i => i.statusPersetujuan === 'APPROVED').length,
      pending: itemsInMonth.filter(i => i.statusPersetujuan === 'PENDING').length,
      rejected: itemsInMonth.filter(i => i.statusPersetujuan === 'REJECTED').length,
    });
  }

  return {
    monthly: monthlyStats,
    byCategory,
    byStatus,
    summary: { pending, approved, rejected, total },
  };
}

// =============================================
// DIRECT CONTENT UPLOAD (BY KESISWAAN)
// =============================================

const CreateAchievementSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  date: z.string(), // ISO date string
  studentId: z.string().uuid(),
  category: z.string().optional(),
  level: z.string().optional(),
});

export async function createAchievementByStaff(formData: FormData) {
  try {
    const rawData = {
      title: formData.get('title'),
      description: formData.get('description'),
      date: formData.get('date'),
      studentId: formData.get('studentId'),
      category: formData.get('category'),
      level: formData.get('level'),
    };

    const validated = CreateAchievementSchema.parse(rawData);

    await prisma.studentAchievement.create({
      data: {
        title: validated.title,
        description: validated.description || '',
        siswaId: validated.studentId,
        achievementDate: new Date(validated.date),
        category: validated.category,
        level: validated.level,
        statusPersetujuan: StatusApproval.APPROVED, // Auto-approve since staff created it
      },
    });

    revalidatePath('/dashboard-kesiswaan');
    return { success: true };
  } catch (error) {
    console.error('Error creating achievement:', error);
    return { success: false, error: 'Failed to create achievement' };
  }
}
