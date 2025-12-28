/*
  Warnings:

  - You are about to drop the column `currentLevel` on the `cohorts` table. All the data in the column will be lost.
  - You are about to drop the column `entryLevel` on the `cohorts` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AssignmentTypes" AS ENUM ('lecture', 'exercise', 'quiz', 'reading');

-- AlterTable
ALTER TABLE "cohorts" DROP COLUMN "currentLevel",
DROP COLUMN "entryLevel",
ADD COLUMN     "currentLevelId" TEXT,
ADD COLUMN     "entryLevelId" TEXT;

-- DropEnum
DROP TYPE "CohortLevels";

-- CreateTable
CREATE TABLE "levels" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weeks" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weeks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendar_weeks" (
    "id" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "weekId" TEXT NOT NULL,
    "academicYear" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calendar_weeks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "programId" TEXT NOT NULL,
    "weekId" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "type" "AssignmentTypes" NOT NULL DEFAULT 'reading',
    "url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "weeks_number_key" ON "weeks"("number");

-- CreateIndex
CREATE INDEX "calendar_weeks_academicYear_startDate_endDate_idx" ON "calendar_weeks"("academicYear", "startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "calendar_weeks_weekId_academicYear_key" ON "calendar_weeks"("weekId", "academicYear");

-- CreateIndex
CREATE INDEX "assignments_programId_weekId_levelId_idx" ON "assignments"("programId", "weekId", "levelId");

-- AddForeignKey
ALTER TABLE "cohorts" ADD CONSTRAINT "cohorts_entryLevelId_fkey" FOREIGN KEY ("entryLevelId") REFERENCES "levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohorts" ADD CONSTRAINT "cohorts_currentLevelId_fkey" FOREIGN KEY ("currentLevelId") REFERENCES "levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_weeks" ADD CONSTRAINT "calendar_weeks_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "weeks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "weeks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
