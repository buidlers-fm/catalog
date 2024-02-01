-- AlterTable
ALTER TABLE "books" ADD COLUMN     "edited" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "wikipedia_url" TEXT;
