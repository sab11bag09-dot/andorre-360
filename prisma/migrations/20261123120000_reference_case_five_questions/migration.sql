-- Jeu de référence : un champ par question (qui ou quoi, où, quand, comment, pourquoi).
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ReferenceCase" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "observationId" INTEGER NOT NULL,
    "whoFacts" TEXT NOT NULL DEFAULT '',
    "whereFacts" TEXT NOT NULL DEFAULT '',
    "whenFacts" TEXT NOT NULL DEFAULT '',
    "howFacts" TEXT NOT NULL DEFAULT '',
    "whyFacts" TEXT NOT NULL DEFAULT '',
    "forbiddenErrors" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "annotatedAt" DATETIME,
    "excludedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ReferenceCase_observationId_fkey" FOREIGN KEY ("observationId") REFERENCES "Observation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
-- Les faits déjà saisis passent dans « Comment ? », en attendant leur reclassement.
INSERT INTO "new_ReferenceCase" ("annotatedAt", "createdAt", "excludedAt", "forbiddenErrors", "howFacts", "id", "notes", "observationId", "updatedAt") SELECT "annotatedAt", "createdAt", "excludedAt", "forbiddenErrors", "requiredFacts", "id", "notes", "observationId", "updatedAt" FROM "ReferenceCase";
DROP TABLE "ReferenceCase";
ALTER TABLE "new_ReferenceCase" RENAME TO "ReferenceCase";
CREATE UNIQUE INDEX "ReferenceCase_observationId_key" ON "ReferenceCase"("observationId");
CREATE INDEX "ReferenceCase_excludedAt_idx" ON "ReferenceCase"("excludedAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

