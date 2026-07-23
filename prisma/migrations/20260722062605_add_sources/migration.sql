-- CreateTable
CREATE TABLE "Source" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "organizationType" TEXT NOT NULL DEFAULT 'OTHER',
    "collectionMode" TEXT NOT NULL DEFAULT 'RSS',
    "checkIntervalMinutes" INTEGER NOT NULL DEFAULT 15,
    "active" BOOLEAN NOT NULL DEFAULT true,
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

-- CreateIndex
CREATE UNIQUE INDEX "Source_url_key" ON "Source"("url");
