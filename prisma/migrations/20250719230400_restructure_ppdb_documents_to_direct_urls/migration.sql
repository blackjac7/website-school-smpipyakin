/*
  Warnings:

  - You are about to drop the `ppdb_documents` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ppdb_documents" DROP CONSTRAINT "ppdb_documents_application_id_fkey";

-- AlterTable
ALTER TABLE "ppdb_applications" ADD COLUMN     "akta_kelahiran_url" VARCHAR(500),
ADD COLUMN     "ijazah_url" VARCHAR(500),
ADD COLUMN     "kartu_keluarga_url" VARCHAR(500),
ADD COLUMN     "pas_foto_url" VARCHAR(500);

-- DropTable
DROP TABLE "ppdb_documents";

-- DropEnum
DROP TYPE "ppdb_document_type";
