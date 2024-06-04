-- CreateTable
CREATE TABLE "person_book_relations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "person_id" UUID NOT NULL,
    "book_id" UUID NOT NULL,
    "relation_type" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "person_book_relations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "person_book_relations_person_id_idx" ON "person_book_relations"("person_id");

-- CreateIndex
CREATE INDEX "person_book_relations_book_id_idx" ON "person_book_relations"("book_id");

-- AddForeignKey
ALTER TABLE "person_book_relations" ADD CONSTRAINT "person_book_relations_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_book_relations" ADD CONSTRAINT "person_book_relations_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;
