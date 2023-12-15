-- CreateTable
CREATE TABLE "user_current_statuses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_profile_id" UUID NOT NULL,
    "book_id" UUID,
    "text" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_current_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_current_statuses_user_profile_id_idx" ON "user_current_statuses"("user_profile_id");

-- CreateIndex
CREATE INDEX "user_current_statuses_book_id_idx" ON "user_current_statuses"("book_id");

-- AddForeignKey
ALTER TABLE "user_current_statuses" ADD CONSTRAINT "user_current_statuses_user_profile_id_fkey" FOREIGN KEY ("user_profile_id") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_current_statuses" ADD CONSTRAINT "user_current_statuses_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE SET NULL ON UPDATE CASCADE;
