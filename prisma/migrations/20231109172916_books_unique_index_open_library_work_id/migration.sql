/*
  Warnings:

  - A unique constraint covering the columns `[open_library_work_id]` on the table `books` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "books_open_library_work_id_key" ON "books"("open_library_work_id");
