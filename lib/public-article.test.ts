import { describe, expect, it } from "vitest";

import {
  getPublicArticleDate,
  isPublicArticle,
  PUBLIC_ARTICLE_FILTER,
} from "./public-article";

describe("règle de publication publique", () => {
  it.each([
    [false, "PUBLISHED", false],
    [true, "DRAFT", false],
    [true, "APPROVED", false],
    [true, "PUBLISHED", true],
  ])(
    "published=%s et statut=%s donne visible=%s",
    (published, editorialStatus, expected) => {
      expect(isPublicArticle({ published, editorialStatus })).toBe(expected);
    },
  );

  it("expose le même filtre aux requêtes Prisma", () => {
    expect(PUBLIC_ARTICLE_FILTER).toEqual({
      published: true,
      editorialStatus: "PUBLISHED",
    });
  });

  it("utilise publishedAt puis createdAt en repli", () => {
    const publishedAt = new Date("2026-08-02T12:00:00.000Z");
    const createdAt = new Date("2026-08-01T12:00:00.000Z");

    expect(getPublicArticleDate({ publishedAt, createdAt })).toBe(publishedAt);
    expect(getPublicArticleDate({ publishedAt: null, createdAt })).toBe(
      createdAt,
    );
  });
});
