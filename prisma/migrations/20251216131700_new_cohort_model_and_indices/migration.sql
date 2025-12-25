/*
  Warnings:

  - The values [frozen] on the enum `UserStatus` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[cohortId,name]` on the table `groups` will be added. If there are existing duplicate values, this will fail.
  - Made the column `code` on table `groups` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "CohortStatus" AS ENUM ('active', 'archived');

-- CreateEnum
CREATE TYPE "CohortLevels" AS ENUM ('level1', 'level2', 'level3', 'level4');

-- AlterEnum
BEGIN;
CREATE TYPE "UserStatus_new" AS ENUM ('active', 'suspended', 'deleted');
ALTER TABLE "public"."users" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "status" TYPE "UserStatus_new" USING ("status"::text::"UserStatus_new");
ALTER TYPE "UserStatus" RENAME TO "UserStatus_old";
ALTER TYPE "UserStatus_new" RENAME TO "UserStatus";
DROP TYPE "public"."UserStatus_old";
ALTER TABLE "users" ALTER COLUMN "status" SET DEFAULT 'active';
COMMIT;

-- DropForeignKey
ALTER TABLE "group_students" DROP CONSTRAINT "group_students_groupId_fkey";

-- DropForeignKey
ALTER TABLE "group_students" DROP CONSTRAINT "group_students_studentId_fkey";

-- AlterTable
ALTER TABLE "groups" ALTER COLUMN "code" SET NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "cohortId" TEXT;

-- CreateTable
CREATE TABLE "cohorts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "entryLevel" "CohortLevels" NOT NULL DEFAULT 'level1',
    "status" "CohortStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cohorts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cohorts_slug_key" ON "cohorts"("slug");

-- CreateIndex
CREATE INDEX "cohorts_status_idx" ON "cohorts"("status");

-- CreateIndex
CREATE INDEX "group_students_groupId_isActive_idx" ON "group_students"("groupId", "isActive");

-- CreateIndex
CREATE INDEX "group_students_studentId_isActive_idx" ON "group_students"("studentId", "isActive");

-- CreateIndex
CREATE INDEX "groups_cohortId_idx" ON "groups"("cohortId");

-- CreateIndex
CREATE INDEX "groups_supervisorId_idx" ON "groups"("supervisorId");

-- CreateIndex
CREATE INDEX "groups_cohortId_supervisorId_idx" ON "groups"("cohortId", "supervisorId");

-- CreateIndex
CREATE UNIQUE INDEX "groups_cohortId_name_key" ON "groups"("cohortId", "name");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_role_status_idx" ON "users"("role", "status");

-- CreateIndex
CREATE INDEX "users_cohortId_role_idx" ON "users"("cohortId", "role");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "cohorts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "cohorts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_students" ADD CONSTRAINT "group_students_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_students" ADD CONSTRAINT "group_students_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
