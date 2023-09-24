-- CreateTable
CREATE TABLE "books" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author_name" TEXT,
    "openlibrary_work_id" TEXT,
    "cover_image_url" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lists" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "creator_id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "list_item_assignments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "list_id" UUID NOT NULL,
    "listed_object_type" TEXT NOT NULL,
    "listed_object_id" UUID NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "list_item_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "books_slug_key" ON "books"("slug");

-- CreateIndex
CREATE INDEX "books_openlibrary_work_id_idx" ON "books"("openlibrary_work_id");

-- CreateIndex
CREATE UNIQUE INDEX "lists_slug_key" ON "lists"("slug");

-- CreateIndex
CREATE INDEX "lists_creator_id_idx" ON "lists"("creator_id");

-- CreateIndex
CREATE INDEX "lists_owner_id_idx" ON "lists"("owner_id");

-- CreateIndex
CREATE INDEX "list_item_assignments_list_id_idx" ON "list_item_assignments"("list_id");

-- CreateIndex
CREATE INDEX "list_item_assignments_listed_object_id_idx" ON "list_item_assignments"("listed_object_id");

-- AddForeignKey
ALTER TABLE "lists" ADD CONSTRAINT "lists_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "user_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list_item_assignments" ADD CONSTRAINT "list_item_assignments_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "lists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
