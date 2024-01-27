/*
  Warnings:

  - You are about to drop the column `archived` on the `Team` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Team" DROP COLUMN "archived",
ADD COLUMN     "archivedAt" TIMESTAMP(3);
