/*
  Warnings:

  - A unique constraint covering the columns `[url]` on the table `assignments_attachments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[fileKey]` on the table `assignments_attachments` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "assignments_attachments_url_key" ON "assignments_attachments"("url");

-- CreateIndex
CREATE UNIQUE INDEX "assignments_attachments_fileKey_key" ON "assignments_attachments"("fileKey");
