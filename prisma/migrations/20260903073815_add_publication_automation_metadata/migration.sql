-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Publication" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "articleId" INTEGER NOT NULL,
    "channel" TEXT NOT NULL,
    "pageKey" TEXT NOT NULL DEFAULT 'home',
    "zone" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "startsAt" DATETIME,
    "endsAt" DATETIME,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "origin" TEXT NOT NULL DEFAULT 'MANUAL',
    "locked" BOOLEAN NOT NULL DEFAULT true,
    "automationScore" INTEGER,
    "automationPolicyVersion" TEXT,
    "automationRunId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editionId" INTEGER,
    CONSTRAINT "Publication_editionId_fkey" FOREIGN KEY ("editionId") REFERENCES "Edition" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Publication_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Publication" ("active", "articleId", "channel", "createdAt", "editionId", "endsAt", "id", "pageKey", "priority", "startsAt", "zone") SELECT "active", "articleId", "channel", "createdAt", "editionId", "endsAt", "id", "pageKey", "priority", "startsAt", "zone" FROM "Publication";
DROP TABLE "Publication";
ALTER TABLE "new_Publication" RENAME TO "Publication";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
