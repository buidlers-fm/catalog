/*
  Warnings:

  - A unique constraint covering the columns `[slug,owner_id]` on the table `lists` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "lists_slug_key";

-- CreateIndex
CREATE UNIQUE INDEX "lists_slug_owner_id_key" ON "lists"("slug", "owner_id");
