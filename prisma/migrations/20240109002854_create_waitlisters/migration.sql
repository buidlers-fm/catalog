-- CreateTable
CREATE TABLE "waitlisters" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "subscribed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "waitlisters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "waitlisters_email_idx" ON "waitlisters"("email");
