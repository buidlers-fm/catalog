-- AlterTable
ALTER TABLE "book_notes" ADD COLUMN     "visibility" TEXT NOT NULL DEFAULT 'public';

-- AlterTable
ALTER TABLE "user_configs" ADD COLUMN     "notes_visibility" TEXT NOT NULL DEFAULT 'public';
