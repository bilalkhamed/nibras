/*
  Warnings:

  - A unique constraint covering the columns `[selector]` on the table `invites` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "invites_selector_key" ON "invites"("selector");

-- CreateIndex
CREATE INDEX "invites_selector_idx" ON "invites"("selector");
