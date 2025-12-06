-- CreateEnum
CREATE TYPE "work_type" AS ENUM ('photo', 'video');

-- CreateTable
CREATE TABLE "student_works" (
    "id" UUID NOT NULL,
    "siswa_id" UUID NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "work_type" "work_type" NOT NULL,
    "media_url" VARCHAR(500),
    "video_link" VARCHAR(500),
    "category" VARCHAR(50),
    "subject" VARCHAR(50),
    "status_persetujuan" "status_approval" NOT NULL,
    "rejection_note" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,

    CONSTRAINT "student_works_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "student_works" ADD CONSTRAINT "student_works_siswa_id_fkey" FOREIGN KEY ("siswa_id") REFERENCES "siswa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
