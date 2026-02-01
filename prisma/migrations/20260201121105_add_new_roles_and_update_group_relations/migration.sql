/*
  Warnings:

  - You are about to drop the column `supervisorId` on the `groups` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'cohort_manager';
ALTER TYPE "Role" ADD VALUE 'group_manager';
ALTER TYPE "Role" ADD VALUE 'media_team';

-- DropForeignKey
ALTER TABLE "groups" DROP CONSTRAINT "groups_supervisorId_fkey";

-- DropIndex
DROP INDEX "groups_cohortId_supervisorId_idx";

-- DropIndex
DROP INDEX "groups_supervisorId_idx";

-- AlterTable
ALTER TABLE "groups" DROP COLUMN "supervisorId";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "supervisedGroupId" TEXT;

-- CreateTable
CREATE TABLE "group_managers" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "group_managers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "group_managers_groupId_idx" ON "group_managers"("groupId");

-- CreateIndex
CREATE INDEX "group_managers_userId_idx" ON "group_managers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "group_managers_groupId_userId_key" ON "group_managers"("groupId", "userId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_supervisedGroupId_fkey" FOREIGN KEY ("supervisedGroupId") REFERENCES "groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_managers" ADD CONSTRAINT "group_managers_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_managers" ADD CONSTRAINT "group_managers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
