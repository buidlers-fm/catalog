-- AlterTable
ALTER TABLE "user_profiles"
ADD COLUMN "name_search" tsvector GENERATED ALWAYS AS (to_tsvector('simple', coalesce(username, '') || ' ' || coalesce(display_name, ''))) STORED;

-- CreateIndex
CREATE INDEX "user_profiles_name_search_idx" ON "user_profiles" USING GIN ("name_search");
