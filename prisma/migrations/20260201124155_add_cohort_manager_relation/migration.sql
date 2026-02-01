-- CreateTable
CREATE TABLE "cohort_managers" (
    "id" TEXT NOT NULL,
    "cohortId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cohort_managers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cohort_managers_cohortId_idx" ON "cohort_managers"("cohortId");

-- CreateIndex
CREATE INDEX "cohort_managers_userId_idx" ON "cohort_managers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "cohort_managers_cohortId_userId_key" ON "cohort_managers"("cohortId", "userId");

-- AddForeignKey
ALTER TABLE "cohort_managers" ADD CONSTRAINT "cohort_managers_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "cohorts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohort_managers" ADD CONSTRAINT "cohort_managers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
