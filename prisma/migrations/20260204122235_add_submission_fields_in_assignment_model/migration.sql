-- AlterTable
ALTER TABLE "assignments" ADD COLUMN     "require_file_submission" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "require_text_submission" BOOLEAN NOT NULL DEFAULT false;
