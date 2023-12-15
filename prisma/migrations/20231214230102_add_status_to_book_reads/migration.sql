/*
  Warnings:

  - Added the required column `status` to the `book_reads` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "book_reads" ADD COLUMN     "status" TEXT NOT NULL;
