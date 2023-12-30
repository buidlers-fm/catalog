-- CreateTable
CREATE TABLE "tag_assignments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tag" TEXT NOT NULL,
    "tagged_object_type" TEXT NOT NULL,
    "tagged_object_id" UUID NOT NULL,
    "scope_type" TEXT,
    "scope_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "tag_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tag_assignments_tagged_object_id_scope_id_idx" ON "tag_assignments"("tagged_object_id", "scope_id");

-- CreateIndex
CREATE INDEX "tag_assignments_scope_id_tag_idx" ON "tag_assignments"("scope_id", "tag");

-- CreateIndex
CREATE UNIQUE INDEX "tag_assignments_tagged_object_id_tagged_object_type_tag_sco_key" ON "tag_assignments"("tagged_object_id", "tagged_object_type", "tag", "scope_type", "scope_id");
