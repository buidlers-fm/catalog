-- AlterTable
ALTER TABLE "book_notes" ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "book_reads" ALTER COLUMN "start_date" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "end_date" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "books" ADD COLUMN     "updated_at" TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "interactions" ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "list_item_assignments" ADD COLUMN     "updated_at" TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "pins" ADD COLUMN     "updated_at" TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "user_profiles" ADD COLUMN     "updated_at" TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "updated_at" TIMESTAMPTZ(6);
