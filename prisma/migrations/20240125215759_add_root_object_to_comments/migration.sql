-- AlterTable
ALTER TABLE "comments" ADD COLUMN     "root_object_id" UUID,
ADD COLUMN     "root_object_type" TEXT;

-- CreateIndex
CREATE INDEX "comments_root_object_id_root_object_type_idx" ON "comments"("root_object_id", "root_object_type");
