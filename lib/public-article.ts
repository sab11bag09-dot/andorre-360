export const PUBLIC_ARTICLE_FILTER = {
  published: true,
  editorialStatus: "PUBLISHED",
} as const;

export function isPublicArticle(article: {
  published: boolean;
  editorialStatus: string;
}): boolean {
  return article.published && article.editorialStatus === "PUBLISHED";
}

export function getPublicArticleDate(article: {
  publishedAt: Date | null;
  createdAt: Date;
}): Date {
  return article.publishedAt ?? article.createdAt;
}
