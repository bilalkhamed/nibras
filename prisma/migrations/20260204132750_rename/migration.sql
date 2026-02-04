/*
  Warnings:

  - You are about to drop the column `require_file_submission` on the `assignments` table. All the data in the column will be lost.
  - You are about to drop the column `require_text_submission` on the `assignments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "assignments" DROP COLUMN "require_file_submission",
DROP COLUMN "require_text_submission",
ADD COLUMN     "allow_file_submission" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "allow_text_submission" BOOLEAN NOT NULL DEFAULT false;
