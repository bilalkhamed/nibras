-- CreateEnum
CREATE TYPE "SupervisorStatus" AS ENUM ('in_training', 'trained');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "supervisorStatus" "SupervisorStatus";
