ALTER TABLE "Article" ADD COLUMN "publishedAt" DATETIME;

-- Les articles publics existants ne disposent pas d'une date de publication
-- historique. Leur date de création constitue le repli le plus stable.
UPDATE "Article"
SET "publishedAt" = "createdAt"
WHERE "published" = 1
  AND "publishedAt" IS NULL;

CREATE INDEX "Article_category_published_publishedAt_idx"
ON "Article"("category", "published", "publishedAt");
