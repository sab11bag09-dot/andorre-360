-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Observation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sourceId" INTEGER NOT NULL,
    "articleId" INTEGER,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publishedAt" DATETIME,
    "content" TEXT,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" DATETIME,
    "collectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Observation_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Observation_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Observation" ("collectedAt", "content", "createdAt", "id", "publishedAt", "sourceId", "title", "updatedAt", "url") SELECT "collectedAt", "content", "createdAt", "id", "publishedAt", "sourceId", "title", "updatedAt", "url" FROM "Observation";
DROP TABLE "Observation";
ALTER TABLE "new_Observation" RENAME TO "Observation";
CREATE INDEX "Observation_sourceId_idx" ON "Observation"("sourceId");
CREATE INDEX "Observation_articleId_idx" ON "Observation"("articleId");
CREATE INDEX "Observation_processed_idx" ON "Observation"("processed");
CREATE INDEX "Observation_publishedAt_idx" ON "Observation"("publishedAt");
CREATE INDEX "Observation_collectedAt_idx" ON "Observation"("collectedAt");
CREATE UNIQUE INDEX "Observation_sourceId_url_key" ON "Observation"("sourceId", "url");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
