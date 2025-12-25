/*
  Warnings:

  - Added the required column `label` to the `cohorts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cohorts" ADD COLUMN     "label" TEXT NOT NULL;
