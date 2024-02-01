-- CreateTable
CREATE TABLE "edit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "editor_id" UUID NOT NULL,
    "edited_type" TEXT NOT NULL,
    "edited_id" UUID NOT NULL,
    "before_json" JSONB NOT NULL,
    "after_json" JSONB NOT NULL,
    "edited_fields" TEXT[],
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "edit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "edit_logs_editor_id_idx" ON "edit_logs"("editor_id");

-- CreateIndex
CREATE INDEX "edit_logs_edited_id_edited_type_idx" ON "edit_logs"("edited_id", "edited_type");

-- AddForeignKey
ALTER TABLE "edit_logs" ADD CONSTRAINT "edit_logs_editor_id_fkey" FOREIGN KEY ("editor_id") REFERENCES "user_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
