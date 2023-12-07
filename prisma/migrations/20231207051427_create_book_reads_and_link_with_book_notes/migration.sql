-- AlterTable
ALTER TABLE "book_notes" ADD COLUMN     "book_read_id" UUID,
ADD COLUMN     "reading_status" TEXT;

-- CreateTable
CREATE TABLE "book_reads" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "reader_id" UUID NOT NULL,
    "book_id" UUID NOT NULL,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "book_reads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "book_reads_reader_id_idx" ON "book_reads"("reader_id");

-- CreateIndex
CREATE INDEX "book_reads_book_id_idx" ON "book_reads"("book_id");

-- CreateIndex
CREATE INDEX "book_notes_book_read_id_idx" ON "book_notes"("book_read_id");

-- AddForeignKey
ALTER TABLE "book_notes" ADD CONSTRAINT "book_notes_book_read_id_fkey" FOREIGN KEY ("book_read_id") REFERENCES "book_reads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_reads" ADD CONSTRAINT "book_reads_reader_id_fkey" FOREIGN KEY ("reader_id") REFERENCES "user_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_reads" ADD CONSTRAINT "book_reads_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
