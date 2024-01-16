-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "agent_id" UUID NOT NULL,
    "agent_type" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "object_id" UUID NOT NULL,
    "object_type" TEXT NOT NULL,
    "source_id" UUID,
    "source_type" TEXT,
    "notified_user_profile_id" UUID NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_agent_id_agent_type_idx" ON "notifications"("agent_id", "agent_type");

-- CreateIndex
CREATE INDEX "notifications_object_id_object_type_idx" ON "notifications"("object_id", "object_type");

-- CreateIndex
CREATE INDEX "notifications_source_id_source_type_idx" ON "notifications"("source_id", "source_type");

-- CreateIndex
CREATE INDEX "notifications_notified_user_profile_id_idx" ON "notifications"("notified_user_profile_id");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_notified_user_profile_id_fkey" FOREIGN KEY ("notified_user_profile_id") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
