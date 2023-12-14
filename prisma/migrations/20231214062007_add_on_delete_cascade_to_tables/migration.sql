-- DropForeignKey
ALTER TABLE "book_notes" DROP CONSTRAINT "book_notes_book_read_id_fkey";

-- DropForeignKey
ALTER TABLE "book_notes" DROP CONSTRAINT "book_notes_creator_id_fkey";

-- DropForeignKey
ALTER TABLE "book_reads" DROP CONSTRAINT "book_reads_reader_id_fkey";

-- DropForeignKey
ALTER TABLE "pins" DROP CONSTRAINT "pins_pinner_id_fkey";

-- AddForeignKey
ALTER TABLE "pins" ADD CONSTRAINT "pins_pinner_id_fkey" FOREIGN KEY ("pinner_id") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_notes" ADD CONSTRAINT "book_notes_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_notes" ADD CONSTRAINT "book_notes_book_read_id_fkey" FOREIGN KEY ("book_read_id") REFERENCES "book_reads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_reads" ADD CONSTRAINT "book_reads_reader_id_fkey" FOREIGN KEY ("reader_id") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
