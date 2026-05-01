/*
  Warnings:

  - Added the required column `max_score` to the `assignments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "assignments" ADD COLUMN     "max_score" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "student_assignments" ALTER COLUMN "score" SET DATA TYPE DOUBLE PRECISION;
