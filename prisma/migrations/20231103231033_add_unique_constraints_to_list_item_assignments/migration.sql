/*
  Warnings:

  - A unique constraint covering the columns `[list_id,listed_object_id,listed_object_type]` on the table `list_item_assignments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[list_id,sort_order]` on the table `list_item_assignments` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "list_item_assignments_list_id_listed_object_id_listed_objec_key" ON "list_item_assignments"("list_id", "listed_object_id", "listed_object_type");

-- CreateIndex
CREATE UNIQUE INDEX "list_item_assignments_list_id_sort_order_key" ON "list_item_assignments"("list_id", "sort_order");
