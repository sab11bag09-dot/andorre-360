import { beforeEach, describe, expect, it, vi } from "vitest";

const { findFirst } = vi.hoisted(() => ({
  findFirst: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    article: {
      findFirst,
    },
  },
}));

import { PrismaPublicArticleSeoRepository } from "./PrismaPublicArticleSeoRepository";

describe("PrismaPublicArticleSeoRepository", () => {
  beforeEach(() => {
    findFirst.mockReset();
  });

  it("filtre les hreflang sur les traductions publiees", async () => {
    findFirst.mockResolvedValue({
      slug: "article-fr",
      translations: [
        { locale: "CA", slug: "article-ca" },
      ],
    });

    const repository =
      new PrismaPublicArticleSeoRepository();

    await expect(
      repository.findPublishedVersionsByArticleId(42),
    ).resolves.toEqual({
      frenchSlug: "article-fr",
      translations: [
        { locale: "CA", slug: "article-ca" },
      ],
    });

    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 42,
          published: true,
          editorialStatus: "PUBLISHED",
        },
        select: expect.objectContaining({
          translations: {
            where: {
              status: "PUBLISHED",
              publishedAt: { not: null },
              locale: { in: ["CA", "ES"] },
            },
            select: {
              locale: true,
              slug: true,
            },
          },
        }),
      }),
    );
  });

  it("exclut entièrement un article français non public", async () => {
    findFirst.mockResolvedValue(null);

    const repository =
      new PrismaPublicArticleSeoRepository();

    await expect(
      repository.findPublishedVersionsByArticleId(42),
    ).resolves.toBeNull();
  });
});
