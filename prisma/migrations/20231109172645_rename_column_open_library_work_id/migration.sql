/*
  Warnings:

  - You are about to drop the column `openlibrary_work_id` on the `books` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "books_openlibrary_work_id_idx";

-- AlterTable
ALTER TABLE "books"
RENAME COLUMN "openlibrary_work_id" TO "open_library_work_id";

-- CreateIndex
CREATE INDEX "books_open_library_work_id_idx" ON "books"("open_library_work_id");
