-- CreateTable
CREATE TABLE "comments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "parent_id" UUID NOT NULL,
    "parent_type" TEXT NOT NULL,
    "commenter_id" UUID NOT NULL,
    "commenter_type" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "comments_parent_id_parent_type_idx" ON "comments"("parent_id", "parent_type");

-- CreateIndex
CREATE INDEX "comments_commenter_id_commenter_type_idx" ON "comments"("commenter_id", "commenter_type");
