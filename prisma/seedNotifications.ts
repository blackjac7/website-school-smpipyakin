import { NotificationService } from "@/lib/notificationService";
import { prisma } from "@/lib/prisma";

async function seedNotifications() {
  try {
    console.log("🌱 Seeding notifications...");

    // Get a student user for testing
    const student = await prisma.user.findFirst({
      where: { role: "SISWA" },
    });

    if (!student) {
      console.log(
        "❌ No student user found. Please create a student user first."
      );
      return;
    }

    // Create sample notifications
    await NotificationService.createAchievementApprovedNotification(
      student.id,
      "Juara 1 Olimpiade Matematika",
      "achievement-1"
    );

    await NotificationService.createWorkRejectedNotification(
      student.id,
      "Video Pembelajaran Fisika",
      "work-1",
      "Kualitas video kurang jernih, mohon diperbaiki"
    );

    await NotificationService.createGeneralNotification(
      student.id,
      "Pengumuman Penting",
      "Pendaftaran ekstrakurikuler tahun ajaran 2025/2026 telah dibuka. Silakan mendaftar melalui dashboard siswa."
    );

    await NotificationService.createSystemAnnouncement(
      "Pemeliharaan Sistem",
      "Sistem akan mengalami pemeliharaan pada tanggal 20 Juli 2025 pukul 02:00 - 04:00 WIB",
      "SISWA"
    );

    console.log("✅ Notifications seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding notifications:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedNotifications();
