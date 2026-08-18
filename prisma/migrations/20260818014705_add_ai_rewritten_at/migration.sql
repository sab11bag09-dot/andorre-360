-- DropIndex
DROP INDEX "Article_fil_info_pagination_idx";

-- AlterTable
ALTER TABLE "Article" ADD COLUMN "aiRewrittenAt" DATETIME;

-- CreateIndex
CREATE INDEX "Article_category_published_editorialStatus_filInfoVisible_publishedAt_createdAt_id_idx" ON "Article"("category", "published", "editorialStatus", "filInfoVisible", "publishedAt", "createdAt", "id");
