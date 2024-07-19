-- CreateTable
CREATE TABLE "job_log_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "job_log_id" UUID NOT NULL,
    "status" TEXT NOT NULL,
    "reason" TEXT,
    "reference" TEXT,
    "data" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "job_log_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "job_log_items_job_log_id_idx" ON "job_log_items"("job_log_id");
