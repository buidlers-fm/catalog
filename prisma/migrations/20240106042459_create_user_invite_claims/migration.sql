-- AlterTable
ALTER TABLE "user_invites" ADD COLUMN     "expires_at" TIMESTAMPTZ(6);

-- CreateTable
CREATE TABLE "user_invite_claims" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "invite_id" UUID NOT NULL,
    "claimed_by_user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "user_invite_claims_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_invite_claims_invite_id_idx" ON "user_invite_claims"("invite_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_invite_claims_claimed_by_user_id_key" ON "user_invite_claims"("claimed_by_user_id");

-- AddForeignKey
ALTER TABLE "user_invite_claims" ADD CONSTRAINT "user_invite_claims_invite_id_fkey" FOREIGN KEY ("invite_id") REFERENCES "user_invites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_invite_claims" ADD CONSTRAINT "user_invite_claims_claimed_by_user_id_fkey" FOREIGN KEY ("claimed_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
