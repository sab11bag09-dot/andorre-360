-- CreateTable
CREATE TABLE "ArticleOrchestrationRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "activeLock" TEXT,
    "policy" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "result" TEXT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" DATETIME
);

-- CreateTable
CREATE TABLE "ArticleOrchestrationItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "runId" TEXT NOT NULL,
    "observationId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CLAIMED',
    "articleId" INTEGER,
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ArticleOrchestrationItem_runId_fkey" FOREIGN KEY ("runId") REFERENCES "ArticleOrchestrationRun" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ArticleOrchestrationRun_activeLock_key" ON "ArticleOrchestrationRun"("activeLock");

-- CreateIndex
CREATE INDEX "ArticleOrchestrationRun_status_startedAt_idx" ON "ArticleOrchestrationRun"("status", "startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleOrchestrationItem_observationId_key" ON "ArticleOrchestrationItem"("observationId");

-- CreateIndex
CREATE INDEX "ArticleOrchestrationItem_runId_idx" ON "ArticleOrchestrationItem"("runId");

