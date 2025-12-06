-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('admin', 'siswa', 'osis', 'kesiswaan', 'ppdb_staff');

-- CreateEnum
CREATE TYPE "gender_type" AS ENUM ('male', 'female');

-- CreateEnum
CREATE TYPE "ppdb_status" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "berita_kategori" AS ENUM ('achievement', 'activity');

-- CreateEnum
CREATE TYPE "status_approval" AS ENUM ('approved', 'rejected', 'pending');

-- CreateEnum
CREATE TYPE "priority_level" AS ENUM ('high', 'medium', 'low');

-- CreateEnum
CREATE TYPE "semester_type" AS ENUM ('ganjil', 'genap');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100),
    "password" VARCHAR(255) NOT NULL,
    "role" "user_role" NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "siswa" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "nisn" VARCHAR(20) NOT NULL,
    "name" VARCHAR(100),
    "image" VARCHAR(255),
    "year" INTEGER,
    "gender" "gender_type" NOT NULL,
    "osis_access" BOOLEAN NOT NULL DEFAULT false,
    "email" VARCHAR(100),
    "phone" VARCHAR(20),
    "address" TEXT,
    "birth_date" DATE,
    "birth_place" VARCHAR(100),
    "parent_name" VARCHAR(100),
    "parent_phone" VARCHAR(20),
    "class" VARCHAR(20),
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,

    CONSTRAINT "siswa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kesiswaan" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "nip" VARCHAR(20) NOT NULL,
    "name" VARCHAR(100),
    "gender" "gender_type" NOT NULL,
    "status_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,

    CONSTRAINT "kesiswaan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ppdb_applications" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "nisn" VARCHAR(20) NOT NULL,
    "gender" "gender_type",
    "birth_date" DATE,
    "asal_sekolah" VARCHAR(100),
    "address" TEXT,
    "no_wa" VARCHAR(20),
    "status" "ppdb_status" NOT NULL DEFAULT 'pending',
    "feedback" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,

    CONSTRAINT "ppdb_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "date" DATE NOT NULL,
    "content" TEXT NOT NULL,
    "image" VARCHAR(255),
    "kategori" "berita_kategori" NOT NULL,
    "status_persetujuan" "status_approval" NOT NULL,
    "author_id" UUID NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,

    CONSTRAINT "news_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "date" DATE NOT NULL,
    "location" VARCHAR(255),
    "content" TEXT NOT NULL,
    "priority" "priority_level" NOT NULL,
    "link_file" VARCHAR(255),
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_activities" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "date" DATE NOT NULL,
    "information" TEXT NOT NULL,
    "semester" "semester_type" NOT NULL,
    "tahun_pelajaran" VARCHAR(20) NOT NULL,
    "created_by" UUID NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,

    CONSTRAINT "school_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_achievements" (
    "id" UUID NOT NULL,
    "siswa_id" UUID NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "image" VARCHAR(255),
    "status_persetujuan" "status_approval" NOT NULL,
    "category" VARCHAR(50),
    "level" VARCHAR(50),
    "achievement_date" DATE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,

    CONSTRAINT "student_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facilities" (
    "id" UUID NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "image" VARCHAR(255),
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,

    CONSTRAINT "facilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "extracurriculars" (
    "id" UUID NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "image" VARCHAR(255),
    "schedule" VARCHAR(100),
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,

    CONSTRAINT "extracurriculars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "login_attempts" (
    "id" UUID NOT NULL,
    "ip" VARCHAR(45) NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "userAgent" VARCHAR(500) NOT NULL,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "failureReason" VARCHAR(255),
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_attempts_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "kesiswaan_userId_key" ON "kesiswaan"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "kesiswaan_nip_key" ON "kesiswaan"("nip");

-- CreateIndex
CREATE UNIQUE INDEX "ppdb_applications_nisn_key" ON "ppdb_applications"("nisn");

-- CreateIndex
CREATE INDEX "login_attempts_ip_createdAt_idx" ON "login_attempts"("ip", "createdAt");

-- CreateIndex
CREATE INDEX "login_attempts_username_createdAt_idx" ON "login_attempts"("username", "createdAt");

-- CreateIndex
CREATE INDEX "login_attempts_success_createdAt_idx" ON "login_attempts"("success", "createdAt");

-- CreateIndex
CREATE INDEX "login_attempts_resolved_createdAt_idx" ON "login_attempts"("resolved", "createdAt");

-- AddForeignKey
ALTER TABLE "siswa" ADD CONSTRAINT "siswa_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kesiswaan" ADD CONSTRAINT "kesiswaan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news" ADD CONSTRAINT "news_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_activities" ADD CONSTRAINT "school_activities_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_achievements" ADD CONSTRAINT "student_achievements_siswa_id_fkey" FOREIGN KEY ("siswa_id") REFERENCES "siswa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
