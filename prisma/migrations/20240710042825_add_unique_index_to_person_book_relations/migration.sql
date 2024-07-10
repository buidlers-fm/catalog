/*
  Warnings:

  - A unique constraint covering the columns `[person_id,book_id,relation_type]` on the table `person_book_relations` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "person_book_relations_person_id_book_id_relation_type_key" ON "person_book_relations"("person_id", "book_id", "relation_type");
