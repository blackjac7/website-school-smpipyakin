/*
  Warnings:

  - The values [approved] on the enum `ppdb_status` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `no_wa` on the `ppdb_applications` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ppdb_document_type" AS ENUM ('ijazah', 'akta_kelahiran', 'kartu_keluarga', 'pas_foto', 'raport_semester', 'surat_keterangan_sehat');

-- AlterEnum
BEGIN;
CREATE TYPE "ppdb_status_new" AS ENUM ('pending', 'accepted', 'rejected');
ALTER TABLE "ppdb_applications" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ppdb_applications" ALTER COLUMN "status" TYPE "ppdb_status_new" USING ("status"::text::"ppdb_status_new");
ALTER TYPE "ppdb_status" RENAME TO "ppdb_status_old";
ALTER TYPE "ppdb_status_new" RENAME TO "ppdb_status";
DROP TYPE "ppdb_status_old";
ALTER TABLE "ppdb_applications" ALTER COLUMN "status" SET DEFAULT 'pending';
COMMIT;

-- AlterTable
ALTER TABLE "ppdb_applications" DROP COLUMN "no_wa",
ADD COLUMN     "average_grade" DOUBLE PRECISION,
ADD COLUMN     "birth_place" VARCHAR(100),
ADD COLUMN     "parent_contact" VARCHAR(20),
ADD COLUMN     "parent_email" VARCHAR(100),
ADD COLUMN     "parent_name" VARCHAR(100);

-- CreateTable
CREATE TABLE "ppdb_documents" (
    "id" UUID NOT NULL,
    "application_id" UUID NOT NULL,
    "document_type" "ppdb_document_type" NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "cloudinary_id" VARCHAR(255) NOT NULL,
    "cloudinary_url" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "uploaded_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ppdb_documents_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ppdb_documents" ADD CONSTRAINT "ppdb_documents_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "ppdb_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
