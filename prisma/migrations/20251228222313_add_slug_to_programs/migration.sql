/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `programs` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "programs" ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "programs_slug_key" ON "programs"("slug");
