-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Source" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "organizationType" TEXT NOT NULL DEFAULT 'OTHER',
    "collectionMode" TEXT NOT NULL DEFAULT 'RSS',
    "checkIntervalMinutes" INTEGER NOT NULL DEFAULT 15,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "availabilityStatus" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "publicationMode" TEXT NOT NULL DEFAULT 'MANUAL',
    "trustLevel" TEXT NOT NULL DEFAULT 'HIGH',
    "category" TEXT,
    "lastCheckedAt" DATETIME,
    "lastSuccessAt" DATETIME,
    "lastErrorAt" DATETIME,
    "lastErrorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Source" ("active", "category", "checkIntervalMinutes", "collectionMode", "createdAt", "description", "id", "lastCheckedAt", "lastErrorAt", "lastErrorMessage", "lastSuccessAt", "name", "organizationType", "publicationMode", "trustLevel", "updatedAt", "url") SELECT "active", "category", "checkIntervalMinutes", "collectionMode", "createdAt", "description", "id", "lastCheckedAt", "lastErrorAt", "lastErrorMessage", "lastSuccessAt", "name", "organizationType", "publicationMode", "trustLevel", "updatedAt", "url" FROM "Source";
DROP TABLE "Source";
ALTER TABLE "new_Source" RENAME TO "Source";
CREATE UNIQUE INDEX "Source_url_key" ON "Source"("url");
CREATE INDEX "Source_active_idx" ON "Source"("active");
CREATE INDEX "Source_collectionMode_idx" ON "Source"("collectionMode");
CREATE INDEX "Source_lastCheckedAt_idx" ON "Source"("lastCheckedAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
