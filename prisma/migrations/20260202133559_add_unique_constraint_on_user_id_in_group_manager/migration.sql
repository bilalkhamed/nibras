/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `group_managers` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "group_managers_userId_key" ON "group_managers"("userId");
