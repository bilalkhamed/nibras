/*
  Warnings:

  - A unique constraint covering the columns `[groupId]` on the table `group_managers` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "group_managers_groupId_key" ON "group_managers"("groupId");
