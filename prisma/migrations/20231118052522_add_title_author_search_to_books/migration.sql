/*
  Warnings:

  - Added the required column `title_author_search` to the `books` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "books"
ADD COLUMN "title_author_search" tsvector GENERATED ALWAYS AS (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(original_title, '') || ' ' || coalesce(author_name, ''))) STORED;

-- CreateIndex
CREATE INDEX "books_title_author_search_idx" ON "books" using gin ("title_author_search");
