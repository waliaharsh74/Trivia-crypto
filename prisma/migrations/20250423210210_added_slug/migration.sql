/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Bet` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Bet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Bet" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Bet_slug_key" ON "Bet"("slug");
