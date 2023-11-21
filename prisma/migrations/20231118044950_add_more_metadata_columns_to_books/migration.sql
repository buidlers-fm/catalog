-- AlterTable
ALTER TABLE "books" ADD COLUMN     "description" TEXT,
ADD COLUMN     "is_translated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "original_title" TEXT,
ADD COLUMN     "subtitle" TEXT;
