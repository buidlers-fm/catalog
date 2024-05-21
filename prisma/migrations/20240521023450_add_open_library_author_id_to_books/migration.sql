-- AlterTable
ALTER TABLE "books" ADD COLUMN     "open_library_author_id" TEXT;

-- CreateIndex
CREATE INDEX "books_open_library_author_id_idx" ON "books"("open_library_author_id");
