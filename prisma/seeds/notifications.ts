import { PrismaClient, NotificationType } from "@prisma/client";

/**
 * Seeds sample notifications for testing
 */
export async function seedNotifications(prisma: PrismaClient) {
  console.log("🔔 Seeding Notifications...");

  // Get a student user for testing
  const student = await prisma.user.findFirst({
    where: { role: "SISWA" },
  });

  if (!student) {
    console.log("  ⚠️ No student user found. Skipping notifications.");
    return;
  }

  // Clear existing notifications
  await prisma.notification.deleteMany();

  // Create sample notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: student.id,
        type: NotificationType.ACHIEVEMENT_APPROVED,
        title: "Prestasi Disetujui",
        message:
          "Selamat! Prestasi Juara 1 Olimpiade Matematika telah disetujui oleh kesiswaan.",
        read: false,
      },
      {
        userId: student.id,
        type: NotificationType.WORK_REJECTED,
        title: "Karya Ditolak",
        message:
          "Karya Video Pembelajaran Fisika ditolak. Alasan: Kualitas video kurang jernih, mohon diperbaiki.",
        read: false,
      },
      {
        userId: student.id,
        type: NotificationType.GENERAL_INFO,
        title: "Pengumuman Penting",
        message:
          "Pendaftaran ekstrakurikuler tahun ajaran 2025/2026 telah dibuka. Silakan mendaftar melalui dashboard siswa.",
        read: true,
      },
      {
        userId: student.id,
        type: NotificationType.SYSTEM_ANNOUNCEMENT,
        title: "Pemeliharaan Sistem",
        message:
          "Sistem akan mengalami pemeliharaan pada tanggal 20 Juli 2025 pukul 02:00 - 04:00 WIB",
        read: true,
      },
    ],
  });

  console.log("✅ Notifications seeded");
}
