-- CreateTable
CREATE TABLE "user_book_shelf_assignments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_profile_id" UUID NOT NULL,
    "book_id" UUID NOT NULL,
    "shelf" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_book_shelf_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_book_shelf_assignments_user_profile_id_idx" ON "user_book_shelf_assignments"("user_profile_id");

-- CreateIndex
CREATE INDEX "user_book_shelf_assignments_book_id_idx" ON "user_book_shelf_assignments"("book_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_book_shelf_assignments_user_profile_id_book_id_key" ON "user_book_shelf_assignments"("user_profile_id", "book_id");

-- AddForeignKey
ALTER TABLE "user_book_shelf_assignments" ADD CONSTRAINT "user_book_shelf_assignments_user_profile_id_fkey" FOREIGN KEY ("user_profile_id") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_book_shelf_assignments" ADD CONSTRAINT "user_book_shelf_assignments_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
