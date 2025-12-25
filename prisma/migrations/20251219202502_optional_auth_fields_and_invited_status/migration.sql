-- AlterEnum
ALTER TYPE "UserStatus" ADD VALUE 'invited';

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "hashedPassword" DROP NOT NULL;
