-- CreateTable
CREATE TABLE "HomeAutomationRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "policyVersion" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'APPLYING',
    "snapshot" TEXT NOT NULL,
    "result" TEXT,
    "actorId" TEXT,
    "actorEmail" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "appliedAt" DATETIME,
    "rolledBackAt" DATETIME,
    CONSTRAINT "HomeAutomationRun_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EditorialEvent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "action" TEXT NOT NULL,
    "articleId" INTEGER,
    "translationId" INTEGER,
    "actorId" TEXT,
    "actorEmail" TEXT NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT,
    "details" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EditorialEvent_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EditorialEvent_translationId_fkey" FOREIGN KEY ("translationId") REFERENCES "ArticleTranslation" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "EditorialEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_EditorialEvent" ("action", "actorEmail", "actorId", "articleId", "createdAt", "details", "fromStatus", "id", "toStatus", "translationId") SELECT "action", "actorEmail", "actorId", "articleId", "createdAt", "details", "fromStatus", "id", "toStatus", "translationId" FROM "EditorialEvent";
DROP TABLE "EditorialEvent";
ALTER TABLE "new_EditorialEvent" RENAME TO "EditorialEvent";
CREATE INDEX "EditorialEvent_articleId_createdAt_idx" ON "EditorialEvent"("articleId", "createdAt");
CREATE INDEX "EditorialEvent_translationId_createdAt_idx" ON "EditorialEvent"("translationId", "createdAt");
CREATE INDEX "EditorialEvent_actorId_createdAt_idx" ON "EditorialEvent"("actorId", "createdAt");
CREATE INDEX "EditorialEvent_action_createdAt_idx" ON "EditorialEvent"("action", "createdAt");
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
    CONSTRAINT "Publication_automationRunId_fkey" FOREIGN KEY ("automationRunId") REFERENCES "HomeAutomationRun" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Publication_editionId_fkey" FOREIGN KEY ("editionId") REFERENCES "Edition" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Publication_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Publication" ("active", "articleId", "automationPolicyVersion", "automationRunId", "automationScore", "channel", "createdAt", "editionId", "endsAt", "id", "locked", "origin", "pageKey", "priority", "startsAt", "updatedAt", "zone") SELECT "active", "articleId", "automationPolicyVersion", "automationRunId", "automationScore", "channel", "createdAt", "editionId", "endsAt", "id", "locked", "origin", "pageKey", "priority", "startsAt", "updatedAt", "zone" FROM "Publication";
DROP TABLE "Publication";
ALTER TABLE "new_Publication" RENAME TO "Publication";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "HomeAutomationRun_status_createdAt_idx" ON "HomeAutomationRun"("status", "createdAt");

-- CreateIndex
CREATE INDEX "HomeAutomationRun_actorId_createdAt_idx" ON "HomeAutomationRun"("actorId", "createdAt");
