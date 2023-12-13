-- CreateTable
CREATE TABLE "interactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "agent_type" TEXT NOT NULL,
    "agent_id" UUID NOT NULL,
    "interaction_type" TEXT NOT NULL,
    "object_type" TEXT NOT NULL,
    "object_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "interactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "interactions_agent_id_agent_type_idx" ON "interactions"("agent_id", "agent_type");

-- CreateIndex
CREATE INDEX "interactions_object_id_object_type_idx" ON "interactions"("object_id", "object_type");

-- CreateIndex
CREATE UNIQUE INDEX "interactions_agent_id_agent_type_interaction_type_object_id_key" ON "interactions"("agent_id", "agent_type", "interaction_type", "object_id", "object_type");
