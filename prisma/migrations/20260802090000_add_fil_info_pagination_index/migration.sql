CREATE INDEX "Article_fil_info_pagination_idx"
ON "Article"(
  "category",
  "published",
  "editorialStatus",
  "filInfoVisible",
  "publishedAt" DESC,
  "createdAt" DESC,
  "id" DESC
);
