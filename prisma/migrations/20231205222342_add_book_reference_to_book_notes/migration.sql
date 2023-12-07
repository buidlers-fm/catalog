-- AddForeignKey
ALTER TABLE "book_notes" ADD CONSTRAINT "book_notes_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
