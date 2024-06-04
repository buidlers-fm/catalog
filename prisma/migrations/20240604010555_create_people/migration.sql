-- CreateTable
CREATE TABLE "people" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "bio" TEXT,
    "image_url" TEXT,
    "wikipedia_url" TEXT,
    "location" TEXT,
    "website" TEXT,
    "open_library_author_id" TEXT,
    "wikidata_id" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "people_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "people_slug_key" ON "people"("slug");

-- CreateIndex
CREATE INDEX "people_slug_idx" ON "people"("slug");

-- CreateIndex
CREATE INDEX "people_open_library_author_id_idx" ON "people"("open_library_author_id");

-- CreateIndex
CREATE INDEX "people_wikidata_id_idx" ON "people"("wikidata_id");
