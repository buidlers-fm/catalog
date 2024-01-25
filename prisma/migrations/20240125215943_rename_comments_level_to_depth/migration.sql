/*
  Warnings:

  - You are about to drop the column `level` on the `comments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "comments" 
RENAME COLUMN "level" TO "depth";
