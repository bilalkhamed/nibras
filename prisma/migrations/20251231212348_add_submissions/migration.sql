-- CreateTable
CREATE TABLE "student_assignments" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "markedById" TEXT,

    CONSTRAINT "student_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "student_assignments_assignmentId_isCompleted_idx" ON "student_assignments"("assignmentId", "isCompleted");

-- CreateIndex
CREATE INDEX "student_assignments_studentId_isCompleted_idx" ON "student_assignments"("studentId", "isCompleted");

-- CreateIndex
CREATE UNIQUE INDEX "student_assignments_studentId_assignmentId_key" ON "student_assignments"("studentId", "assignmentId");

-- AddForeignKey
ALTER TABLE "student_assignments" ADD CONSTRAINT "student_assignments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_assignments" ADD CONSTRAINT "student_assignments_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_assignments" ADD CONSTRAINT "student_assignments_markedById_fkey" FOREIGN KEY ("markedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
