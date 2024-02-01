-- Rename columns
ALTER TABLE "edit_logs"
RENAME COLUMN "edited_id" TO "edited_object_id";

ALTER TABLE "edit_logs"
RENAME COLUMN "edited_type" TO "edited_object_type";

-- Rename index
ALTER INDEX "edit_logs_edited_id_edited_type_idx" RENAME TO "edit_logs_edited_object_id_edited_object_type_idx";