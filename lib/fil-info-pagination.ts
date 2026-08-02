import type { ArticleChronologyCursor } from "./articles";

type CursorArticle = {
  id: number;
  publishedAt: Date | null;
  createdAt: Date;
};

export function createFilInfoCursor(article: CursorArticle): string {
  return [
    (article.publishedAt ?? article.createdAt).toISOString(),
    article.createdAt.toISOString(),
    String(article.id),
  ].join("|");
}

export function parseFilInfoCursor(
  value: string | null,
): ArticleChronologyCursor | null {
  if (!value) {
    return null;
  }

  const [publishedAtValue, createdAtValue, idValue, ...extra] =
    value.split("|");
  const publishedAt = new Date(publishedAtValue);
  const createdAt = new Date(createdAtValue);
  const id = Number(idValue);

  if (
    extra.length > 0 ||
    Number.isNaN(publishedAt.getTime()) ||
    Number.isNaN(createdAt.getTime()) ||
    !Number.isInteger(id) ||
    id <= 0
  ) {
    return null;
  }

  return { publishedAt, createdAt, id };
}

export type FilInfoPageEntry = {
  id: number;
  slug: string;
  title: string;
  description: string;
  filInfoFormat: "ALERT" | "BRIEF" | "ARTICLE";
  publicationDate: string;
};
