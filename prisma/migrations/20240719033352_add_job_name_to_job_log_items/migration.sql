/*
  Warnings:

  - Added the required column `job_name` to the `job_log_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "job_log_items" ADD COLUMN     "job_name" TEXT NOT NULL;
