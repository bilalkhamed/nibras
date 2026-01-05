/*
  Warnings:

  - You are about to drop the column `url` on the `assignments` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AttachmentType" AS ENUM ('FILE', 'LINK');

-- AlterTable
ALTER TABLE "assignments" DROP COLUMN "url";

-- CreateTable
CREATE TABLE "assignments_attachments" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "type" "AttachmentType" NOT NULL DEFAULT 'FILE',
    "name" TEXT,
    "url" TEXT,
    "fileKey" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assignments_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "assignments_attachments_assignmentId_idx" ON "assignments_attachments"("assignmentId");

-- AddForeignKey
ALTER TABLE "assignments_attachments" ADD CONSTRAINT "assignments_attachments_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
