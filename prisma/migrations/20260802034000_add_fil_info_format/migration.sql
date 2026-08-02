ALTER TABLE "Article"
ADD COLUMN "filInfoFormat" TEXT NOT NULL DEFAULT 'ARTICLE';

CREATE INDEX "Article_filInfoFormat_idx"
ON "Article"("filInfoFormat");
