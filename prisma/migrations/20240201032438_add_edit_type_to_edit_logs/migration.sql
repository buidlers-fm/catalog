/*
  Warnings:

  - Added the required column `edit_type` to the `edit_logs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "edit_logs" ADD COLUMN     "edit_type" TEXT NOT NULL;
