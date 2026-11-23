-- AlterTable
ALTER TABLE "AiUsage" ADD COLUMN "articleId" INTEGER;
ALTER TABLE "AiUsage" ADD COLUMN "observationId" INTEGER;

-- CreateIndex
CREATE INDEX "AiUsage_observationId_idx" ON "AiUsage"("observationId");

-- CreateIndex
CREATE INDEX "AiUsage_articleId_idx" ON "AiUsage"("articleId");

