/*
  Warnings:

  - Made the column `currentLevelId` on table `cohorts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `entryLevelId` on table `cohorts` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "cohorts" DROP CONSTRAINT "cohorts_currentLevelId_fkey";

-- DropForeignKey
ALTER TABLE "cohorts" DROP CONSTRAINT "cohorts_entryLevelId_fkey";

-- AlterTable
ALTER TABLE "cohorts" ALTER COLUMN "currentLevelId" SET NOT NULL,
ALTER COLUMN "entryLevelId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "cohorts" ADD CONSTRAINT "cohorts_entryLevelId_fkey" FOREIGN KEY ("entryLevelId") REFERENCES "levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohorts" ADD CONSTRAINT "cohorts_currentLevelId_fkey" FOREIGN KEY ("currentLevelId") REFERENCES "levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
