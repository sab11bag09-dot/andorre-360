-- CreateTable
CREATE TABLE "Observation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sourceId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publishedAt" DATETIME,
    "content" TEXT,
    "collectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Observation_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Observation_sourceId_idx" ON "Observation"("sourceId");

-- CreateIndex
CREATE INDEX "Observation_publishedAt_idx" ON "Observation"("publishedAt");

-- CreateIndex
CREATE INDEX "Observation_collectedAt_idx" ON "Observation"("collectedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Observation_sourceId_url_key" ON "Observation"("sourceId", "url");
