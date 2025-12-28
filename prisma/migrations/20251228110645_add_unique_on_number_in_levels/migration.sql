/*
  Warnings:

  - A unique constraint covering the columns `[number]` on the table `levels` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "levels_number_key" ON "levels"("number");
