/*
  Warnings:

  - You are about to drop the column `name_search` on the `user_profiles` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "user_profiles_name_search_idx";

-- AlterTable
ALTER TABLE "user_profiles" DROP COLUMN "name_search";
