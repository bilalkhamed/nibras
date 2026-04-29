-- CreateEnum
CREATE TYPE "GradeLevel" AS ENUM ('first_grade', 'second_grade', 'third_grade', 'fourth_grade', 'fifth_grade', 'sixth_grade', 'seventh_grade', 'eighth_grade', 'ninth_grade', 'tenth_grade', 'eleventh_grade', 'twelfth_grade', 'bachelor');

-- CreateTable
CREATE TABLE "student_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "adress" TEXT,
    "motherFullName" TEXT,
    "motherPhone" TEXT,
    "gradeLevel" "GradeLevel",
    "skills" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "student_profiles_userId_key" ON "student_profiles"("userId");

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
