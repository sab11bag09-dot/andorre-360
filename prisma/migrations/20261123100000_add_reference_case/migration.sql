-- CreateTable
CREATE TABLE "ReferenceCase" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "observationId" INTEGER NOT NULL,
    "requiredFacts" TEXT NOT NULL DEFAULT '',
    "forbiddenErrors" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "annotatedAt" DATETIME,
    "excludedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ReferenceCase_observationId_fkey" FOREIGN KEY ("observationId") REFERENCES "Observation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ReferenceCase_observationId_key" ON "ReferenceCase"("observationId");

-- CreateIndex
CREATE INDEX "ReferenceCase_excludedAt_idx" ON "ReferenceCase"("excludedAt");
