/*
  Warnings:

  - You are about to drop the column `adress` on the `student_profiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "student_profiles" DROP COLUMN "adress",
ADD COLUMN     "address" TEXT;
