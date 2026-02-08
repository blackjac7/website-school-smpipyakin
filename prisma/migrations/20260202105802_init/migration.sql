-- CreateEnum
CREATE TYPE "teacher_category" AS ENUM ('pimpinan', 'guru_mapel', 'staff');

-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('admin', 'siswa', 'osis', 'kesiswaan', 'ppdb_admin', 'pembina_osis');

-- CreateEnum
CREATE TYPE "gender_type" AS ENUM ('male', 'female');

-- CreateEnum
CREATE TYPE "ppdb_status" AS ENUM ('pending', 'accepted', 'rejected');

-- CreateEnum
CREATE TYPE "berita_kategori" AS ENUM ('achievement', 'activity');

-- CreateEnum
CREATE TYPE "status_approval" AS ENUM ('approved', 'rejected', 'pending');

-- CreateEnum
CREATE TYPE "priority_level" AS ENUM ('high', 'medium', 'low');

-- CreateEnum
CREATE TYPE "work_type" AS ENUM ('photo', 'video');

-- CreateEnum
CREATE TYPE "semester_type" AS ENUM ('ganjil', 'genap');

-- CreateEnum
CREATE TYPE "notification_type" AS ENUM ('achievement_approved', 'achievement_rejected', 'work_approved', 'work_rejected', 'general_info', 'ppdb_update', 'system_announcement');

-- CreateEnum
CREATE TYPE "prayer_time" AS ENUM ('zuhur', 'ashar', 'jumat');

-- CreateEnum
CREATE TYPE "task_status" AS ENUM ('pending', 'completed', 'missed');

-- CreateEnum
CREATE TYPE "carpet_zone" AS ENUM ('floor_1', 'floor_2');

-- CreateEnum
CREATE TYPE "setting_type" AS ENUM ('STRING', 'NUMBER', 'BOOLEAN', 'DATE', 'JSON');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "role" "user_role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "siswa" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nisn" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "year" INTEGER,
    "gender" "gender_type" NOT NULL,
    "osis_access" BOOLEAN NOT NULL DEFAULT false,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "birth_date" TIMESTAMP(3),
    "birth_place" TEXT,
    "parent_name" TEXT,
    "parent_phone" TEXT,
    "class" TEXT,
    "qr_token" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "siswa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kesiswaan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nip" TEXT NOT NULL,
    "name" TEXT,
    "gender" "gender_type" NOT NULL,
    "status_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kesiswaan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ppdb_applications" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nisn" TEXT NOT NULL,
    "gender" "gender_type",
    "birth_place" TEXT,
    "birth_date" TIMESTAMP(3),
    "address" TEXT,
    "asal_sekolah" TEXT,
    "parent_contact" TEXT,
    "parent_name" TEXT,
    "parent_email" TEXT,
    "status" "ppdb_status" NOT NULL DEFAULT 'pending',
    "feedback" TEXT,
    "ijazah_url" TEXT,
    "akta_kelahiran_url" TEXT,
    "kartu_keluarga_url" TEXT,
    "pas_foto_url" TEXT,
    "retries" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ppdb_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL,
    "image" TEXT,
    "kategori" "berita_kategori" NOT NULL,
    "status_persetujuan" "status_approval" NOT NULL,
    "rejection_note" TEXT,
    "author_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "content" TEXT NOT NULL,
    "priority" "priority_level" NOT NULL,
    "link_file" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hero_slides" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "image_small" TEXT NOT NULL,
    "image_medium" TEXT NOT NULL,
    "link_primary_text" TEXT,
    "link_primary_href" TEXT,
    "link_secondary_text" TEXT,
    "link_secondary_href" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hero_slides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_stats" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "icon_name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_activities" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "information" TEXT NOT NULL,
    "semester" "semester_type" NOT NULL,
    "tahun_pelajaran" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "osis_activities" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "budget" INTEGER NOT NULL,
    "participants" INTEGER NOT NULL,
    "organizer" TEXT NOT NULL,
    "proposal_url" TEXT,
    "status" "status_approval" NOT NULL DEFAULT 'pending',
    "rejection_note" TEXT,
    "author_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "osis_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_achievements" (
    "id" TEXT NOT NULL,
    "siswa_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "status_persetujuan" "status_approval" NOT NULL,
    "category" TEXT,
    "level" TEXT,
    "achievement_date" TIMESTAMP(3),
    "rejection_note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_works" (
    "id" TEXT NOT NULL,
    "siswa_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "work_type" "work_type" NOT NULL,
    "media_url" TEXT,
    "video_link" TEXT,
    "category" TEXT,
    "subject" TEXT,
    "status_persetujuan" "status_approval" NOT NULL,
    "rejection_note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_works_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facilities" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "extracurriculars" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "schedule" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "extracurriculars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teachers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "category" "teacher_category" NOT NULL,
    "photo" TEXT,
    "subject" TEXT,
    "description" TEXT,
    "experience" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "login_attempts" (
    "id" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "failureReason" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lateness_records" (
    "id" TEXT NOT NULL,
    "siswa_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "arrival_time" TEXT NOT NULL,
    "reason" TEXT,
    "recorded_by" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lateness_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "notification_type" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worship_menstruation_records" (
    "id" TEXT NOT NULL,
    "siswa_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "worship_menstruation_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worship_adzan_schedules" (
    "id" TEXT NOT NULL,
    "siswa_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "prayer_time" "prayer_time" NOT NULL,
    "status" "task_status" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "worship_adzan_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worship_carpet_schedules" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "zone" "carpet_zone" NOT NULL,
    "status" "task_status" NOT NULL DEFAULT 'pending',
    "class_name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "worship_carpet_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worship_carpet_assignments" (
    "id" TEXT NOT NULL,
    "schedule_id" TEXT NOT NULL,
    "siswa_id" TEXT NOT NULL,

    CONSTRAINT "worship_carpet_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" "setting_type" NOT NULL DEFAULT 'STRING',
    "category" TEXT NOT NULL DEFAULT 'general',
    "description" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_schedules" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "affected_paths" TEXT[],
    "message" TEXT NOT NULL DEFAULT 'Website sedang dalam pemeliharaan. Silakan kembali beberapa saat lagi.',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,

    CONSTRAINT "maintenance_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "siswa_userId_key" ON "siswa"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "siswa_nisn_key" ON "siswa"("nisn");

-- CreateIndex
CREATE UNIQUE INDEX "siswa_qr_token_key" ON "siswa"("qr_token");

-- CreateIndex
CREATE UNIQUE INDEX "kesiswaan_userId_key" ON "kesiswaan"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "kesiswaan_nip_key" ON "kesiswaan"("nip");

-- CreateIndex
CREATE INDEX "kesiswaan_status_active_idx" ON "kesiswaan"("status_active");

-- CreateIndex
CREATE INDEX "kesiswaan_nip_idx" ON "kesiswaan"("nip");

-- CreateIndex
CREATE UNIQUE INDEX "ppdb_applications_nisn_key" ON "ppdb_applications"("nisn");

-- CreateIndex
CREATE INDEX "ppdb_applications_status_createdAt_idx" ON "ppdb_applications"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ppdb_applications_createdAt_idx" ON "ppdb_applications"("createdAt");

-- CreateIndex
CREATE INDEX "announcements_createdAt_idx" ON "announcements"("createdAt");

-- CreateIndex
CREATE INDEX "announcements_priority_createdAt_idx" ON "announcements"("priority", "createdAt");

-- CreateIndex
CREATE INDEX "osis_activities_status_createdAt_idx" ON "osis_activities"("status", "createdAt");

-- CreateIndex
CREATE INDEX "osis_activities_date_idx" ON "osis_activities"("date");

-- CreateIndex
CREATE INDEX "osis_activities_author_id_status_idx" ON "osis_activities"("author_id", "status");

-- CreateIndex
CREATE INDEX "student_achievements_siswa_id_status_persetujuan_idx" ON "student_achievements"("siswa_id", "status_persetujuan");

-- CreateIndex
CREATE INDEX "student_achievements_status_persetujuan_createdAt_idx" ON "student_achievements"("status_persetujuan", "createdAt");

-- CreateIndex
CREATE INDEX "student_works_siswa_id_status_persetujuan_idx" ON "student_works"("siswa_id", "status_persetujuan");

-- CreateIndex
CREATE INDEX "student_works_status_persetujuan_createdAt_idx" ON "student_works"("status_persetujuan", "createdAt");

-- CreateIndex
CREATE INDEX "facilities_createdAt_idx" ON "facilities"("createdAt");

-- CreateIndex
CREATE INDEX "login_attempts_ip_createdAt_idx" ON "login_attempts"("ip", "createdAt");

-- CreateIndex
CREATE INDEX "login_attempts_username_createdAt_idx" ON "login_attempts"("username", "createdAt");

-- CreateIndex
CREATE INDEX "login_attempts_success_createdAt_idx" ON "login_attempts"("success", "createdAt");

-- CreateIndex
CREATE INDEX "login_attempts_resolved_createdAt_idx" ON "login_attempts"("resolved", "createdAt");

-- CreateIndex
CREATE INDEX "lateness_records_siswa_id_date_idx" ON "lateness_records"("siswa_id", "date");

-- CreateIndex
CREATE INDEX "lateness_records_date_idx" ON "lateness_records"("date");

-- CreateIndex
CREATE INDEX "lateness_records_recorded_by_idx" ON "lateness_records"("recorded_by");

-- CreateIndex
CREATE INDEX "notifications_userId_read_createdAt_idx" ON "notifications"("userId", "read", "createdAt");

-- CreateIndex
CREATE INDEX "worship_adzan_schedules_date_status_idx" ON "worship_adzan_schedules"("date", "status");

-- CreateIndex
CREATE INDEX "worship_adzan_schedules_siswa_id_date_idx" ON "worship_adzan_schedules"("siswa_id", "date");

-- CreateIndex
CREATE INDEX "worship_carpet_schedules_date_status_idx" ON "worship_carpet_schedules"("date", "status");

-- CreateIndex
CREATE INDEX "worship_carpet_schedules_date_zone_idx" ON "worship_carpet_schedules"("date", "zone");

-- CreateIndex
CREATE UNIQUE INDEX "site_settings_key_key" ON "site_settings"("key");

-- AddForeignKey
ALTER TABLE "siswa" ADD CONSTRAINT "siswa_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kesiswaan" ADD CONSTRAINT "kesiswaan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news" ADD CONSTRAINT "news_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_activities" ADD CONSTRAINT "school_activities_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "osis_activities" ADD CONSTRAINT "osis_activities_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_achievements" ADD CONSTRAINT "student_achievements_siswa_id_fkey" FOREIGN KEY ("siswa_id") REFERENCES "siswa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_works" ADD CONSTRAINT "student_works_siswa_id_fkey" FOREIGN KEY ("siswa_id") REFERENCES "siswa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lateness_records" ADD CONSTRAINT "lateness_records_siswa_id_fkey" FOREIGN KEY ("siswa_id") REFERENCES "siswa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lateness_records" ADD CONSTRAINT "lateness_records_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worship_menstruation_records" ADD CONSTRAINT "worship_menstruation_records_siswa_id_fkey" FOREIGN KEY ("siswa_id") REFERENCES "siswa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worship_adzan_schedules" ADD CONSTRAINT "worship_adzan_schedules_siswa_id_fkey" FOREIGN KEY ("siswa_id") REFERENCES "siswa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worship_carpet_assignments" ADD CONSTRAINT "worship_carpet_assignments_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "worship_carpet_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worship_carpet_assignments" ADD CONSTRAINT "worship_carpet_assignments_siswa_id_fkey" FOREIGN KEY ("siswa_id") REFERENCES "siswa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
