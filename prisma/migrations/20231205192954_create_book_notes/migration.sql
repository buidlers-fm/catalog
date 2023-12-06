-- CreateTable
CREATE TABLE "book_notes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "creator_id" UUID NOT NULL,
    "book_id" UUID NOT NULL,
    "note_type" TEXT NOT NULL,
    "text" TEXT,
    "title" TEXT,
    "link_url" TEXT,
    "start_date" TIMESTAMP(3),
    "finish_date" TIMESTAMP(3),
    "finished" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "book_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "book_notes_creator_id_idx" ON "book_notes"("creator_id");

-- CreateIndex
CREATE INDEX "book_notes_book_id_idx" ON "book_notes"("book_id");

-- AddForeignKey
ALTER TABLE "book_notes" ADD CONSTRAINT "book_notes_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "user_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
