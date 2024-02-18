-- CreateTable
CREATE TABLE "adaptations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "book_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "date_string" TEXT,
    "year" INTEGER,
    "poster_image_url" TEXT,
    "letterboxd_url" TEXT,
    "tmdb_url" TEXT,
    "imdb_url" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "adaptations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "adaptations_book_id_idx" ON "adaptations"("book_id");

-- AddForeignKey
ALTER TABLE "adaptations" ADD CONSTRAINT "adaptations_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;
