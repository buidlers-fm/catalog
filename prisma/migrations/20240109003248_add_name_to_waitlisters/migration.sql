/*
  Warnings:

  - Added the required column `name` to the `waitlisters` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "waitlisters" ADD COLUMN     "name" TEXT NOT NULL;
