-- CreateTable
CREATE TABLE "pins" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "pinner_id" UUID NOT NULL,
    "pinned_object_type" TEXT NOT NULL,
    "pinned_object_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sort_order" INTEGER NOT NULL,

    CONSTRAINT "pins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pins_pinner_id_idx" ON "pins"("pinner_id");

-- CreateIndex
CREATE INDEX "pins_pinned_object_id_idx" ON "pins"("pinned_object_id");

-- CreateIndex
CREATE UNIQUE INDEX "pins_pinner_id_pinned_object_id_pinned_object_type_key" ON "pins"("pinner_id", "pinned_object_id", "pinned_object_type");

-- CreateIndex
CREATE UNIQUE INDEX "pins_pinner_id_sort_order_key" ON "pins"("pinner_id", "sort_order");

-- AddForeignKey
ALTER TABLE "pins" ADD CONSTRAINT "pins_pinner_id_fkey" FOREIGN KEY ("pinner_id") REFERENCES "user_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
