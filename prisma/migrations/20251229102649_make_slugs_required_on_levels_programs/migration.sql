/*
  Warnings:

  - Made the column `slug` on table `levels` required. This step will fail if there are existing NULL values in that column.
  - Made the column `slug` on table `programs` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "levels" ALTER COLUMN "slug" SET NOT NULL;

-- AlterTable
ALTER TABLE "programs" ALTER COLUMN "slug" SET NOT NULL;
