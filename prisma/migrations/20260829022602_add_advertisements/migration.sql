-- CreateTable
CREATE TABLE "Advertisement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "imagePath" TEXT NOT NULL,
    "targetUrl" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "pageKey" TEXT NOT NULL DEFAULT 'actualite',
    "active" BOOLEAN NOT NULL DEFAULT false,
    "startsAt" DATETIME,
    "endsAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Advertisement_pageKey_active_startsAt_endsAt_idx" ON "Advertisement"("pageKey", "active", "startsAt", "endsAt");
