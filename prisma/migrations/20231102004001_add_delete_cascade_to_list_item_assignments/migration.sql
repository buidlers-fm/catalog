-- DropForeignKey
ALTER TABLE "list_item_assignments" DROP CONSTRAINT "list_item_assignments_list_id_fkey";

-- AddForeignKey
ALTER TABLE "list_item_assignments" ADD CONSTRAINT "list_item_assignments_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
