-- CreateTable
CREATE TABLE "recommendations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "recommender_id" UUID NOT NULL,
    "book_id" UUID NOT NULL,
    "recipient_id" UUID NOT NULL,
    "recipient_type" TEXT NOT NULL,
    "note" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "recommendations_recommender_id_idx" ON "recommendations"("recommender_id");

-- CreateIndex
CREATE INDEX "recommendations_book_id_idx" ON "recommendations"("book_id");

-- CreateIndex
CREATE INDEX "recommendations_recipient_id_recipient_type_idx" ON "recommendations"("recipient_id", "recipient_type");

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_recommender_id_fkey" FOREIGN KEY ("recommender_id") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;
