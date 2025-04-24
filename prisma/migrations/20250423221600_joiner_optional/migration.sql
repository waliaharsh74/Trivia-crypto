-- DropForeignKey
ALTER TABLE "Bet" DROP CONSTRAINT "Bet_joinerId_fkey";

-- AlterTable
ALTER TABLE "Bet" ALTER COLUMN "joinerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Bet" ADD CONSTRAINT "Bet_joinerId_fkey" FOREIGN KEY ("joinerId") REFERENCES "User"("address") ON DELETE SET NULL ON UPDATE CASCADE;
