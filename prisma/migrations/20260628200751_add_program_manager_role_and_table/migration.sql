-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'program_manager';

-- CreateTable
CREATE TABLE "program_managers" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "program_managers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "program_managers_programId_idx" ON "program_managers"("programId");

-- CreateIndex
CREATE INDEX "program_managers_userId_idx" ON "program_managers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "program_managers_programId_userId_key" ON "program_managers"("programId", "userId");

-- AddForeignKey
ALTER TABLE "program_managers" ADD CONSTRAINT "program_managers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_managers" ADD CONSTRAINT "program_managers_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
