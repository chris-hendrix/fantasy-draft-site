/*
  Warnings:

  - You are about to drop the column `defaultKeeps` on the `League` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Draft" ADD COLUMN     "keeperCount" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "League" DROP COLUMN "defaultKeeps",
ADD COLUMN     "defaultKeeperCount" INTEGER;
