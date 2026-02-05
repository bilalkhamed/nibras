-- AlterTable
ALTER TABLE "student_assignments" ADD COLUMN     "comment" TEXT,
ADD COLUMN     "gradedById" TEXT,
ADD COLUMN     "score" INTEGER;

-- AddForeignKey
ALTER TABLE "student_assignments" ADD CONSTRAINT "student_assignments_gradedById_fkey" FOREIGN KEY ("gradedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
