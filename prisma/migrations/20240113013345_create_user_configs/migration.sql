-- CreateTable
CREATE TABLE "user_configs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_profile_id" UUID NOT NULL,
    "has_new_announcements" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "user_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_configs_user_profile_id_key" ON "user_configs"("user_profile_id");

-- AddForeignKey
ALTER TABLE "user_configs" ADD CONSTRAINT "user_configs_user_profile_id_fkey" FOREIGN KEY ("user_profile_id") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
