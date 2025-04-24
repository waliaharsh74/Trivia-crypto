/*
  Warnings:

  - Added the required column `amount` to the `Bet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `topic` to the `Bet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Bet" ADD COLUMN     "amount" TEXT NOT NULL,
ADD COLUMN     "creatorCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "joinerCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "topic" TEXT NOT NULL;
