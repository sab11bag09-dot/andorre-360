import { beforeEach, describe, expect, it, vi } from "vitest";

const { findUnique } = vi.hoisted(() => ({
  findUnique: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    article: {
      findUnique,
    },
  },
}));

import { PrismaPublicArticleSeoRepository } from "./PrismaPublicArticleSeoRepository";

describe("PrismaPublicArticleSeoRepository", () => {
  beforeEach(() => {
    findUnique.mockReset();
  });

  it("filtre les hreflang sur les traductions publiees", async () => {
    findUnique.mockResolvedValue({
      published: true,
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

    expect(findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 42 },
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

  it("exclut la version francaise non publiee", async () => {
    findUnique.mockResolvedValue({
      published: false,
      slug: "brouillon-fr",
      translations: [
        { locale: "ES", slug: "article-es" },
      ],
    });

    const repository =
      new PrismaPublicArticleSeoRepository();

    await expect(
      repository.findPublishedVersionsByArticleId(42),
    ).resolves.toEqual({
      frenchSlug: null,
      translations: [
        { locale: "ES", slug: "article-es" },
      ],
    });
  });
});
