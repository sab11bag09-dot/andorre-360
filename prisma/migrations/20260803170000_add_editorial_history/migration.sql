CREATE TABLE "EditorialEvent" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "action" TEXT NOT NULL,
  "articleId" INTEGER NOT NULL,
  "translationId" INTEGER,
  "actorId" TEXT,
  "actorEmail" TEXT NOT NULL,
  "fromStatus" TEXT,
  "toStatus" TEXT,
  "details" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EditorialEvent_articleId_fkey"
    FOREIGN KEY ("articleId") REFERENCES "Article" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "EditorialEvent_translationId_fkey"
    FOREIGN KEY ("translationId") REFERENCES "ArticleTranslation" ("id")
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "EditorialEvent_actorId_fkey"
    FOREIGN KEY ("actorId") REFERENCES "User" ("id")
    ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "EditorialEvent_articleId_createdAt_idx"
ON "EditorialEvent"("articleId", "createdAt");

CREATE INDEX "EditorialEvent_translationId_createdAt_idx"
ON "EditorialEvent"("translationId", "createdAt");

CREATE INDEX "EditorialEvent_actorId_createdAt_idx"
ON "EditorialEvent"("actorId", "createdAt");

CREATE INDEX "EditorialEvent_action_createdAt_idx"
ON "EditorialEvent"("action", "createdAt");
