import type { Prisma } from "@prisma/client";

type PublicationWithArticle = Prisma.PublicationGetPayload<{
  include: {
    article: true;
  };
}>;

export function makePublication(
  overrides: Partial<PublicationWithArticle> = {}
): PublicationWithArticle {
  const now = new Date("2026-07-29T10:00:00.000Z");

  return {
    id: "publication-1",
    pageKey: "home",
    channel: "site",
    zone: "hero",
    priority: 1,
    active: true,
    startsAt: null,
    endsAt: null,
    createdAt: now,
    updatedAt: now,
    articleId: "article-1",
    article: {} as PublicationWithArticle["article"],
    ...overrides,
  };
}