/*
  Warnings:

  - You are about to drop the column `finish_date` on the `book_notes` table. All the data in the column will be lost.
  - You are about to drop the column `finished` on the `book_notes` table. All the data in the column will be lost.
  - You are about to drop the column `start_date` on the `book_notes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "book_notes" DROP COLUMN "finish_date",
DROP COLUMN "finished",
DROP COLUMN "start_date";
