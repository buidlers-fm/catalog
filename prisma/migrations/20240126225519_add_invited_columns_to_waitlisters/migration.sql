-- AlterTable
ALTER TABLE "waitlisters" ADD COLUMN     "invited_at" TIMESTAMPTZ(6),
ADD COLUMN     "invited_by_user_profile_id" UUID;
