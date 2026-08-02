import { beforeEach, describe, expect, it, vi } from "vitest";

const { findFirst } = vi.hoisted(() => ({
  findFirst: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    articleTranslation: {
      findFirst,
    },
  },
}));

import { PrismaPublicArticleTranslationRepository } from "./PrismaPublicArticleTranslationRepository";

describe("PrismaPublicArticleTranslationRepository", () => {
  beforeEach(() => {
    findFirst.mockReset();
  });

  it("exige le statut PUBLISHED dans la requete publique", async () => {
    findFirst.mockResolvedValue({
      articleId: 12,
      locale: "CA",
      title: "Títol",
      description: "Descripció",
      content: "Contingut",
      slug: "titol",
      publishedAt: new Date("2026-08-01T12:00:00.000Z"),
      article: {
        category: "Societat",
        image: " /image.jpg ",
        author: "Redacció",
        readingTime: "2 min",
        videoUrl: null,
      },
    });

    const repository =
      new PrismaPublicArticleTranslationRepository();
    const result = await repository.findPublishedByLocaleAndSlug(
      "CA",
      "titol",
    );

    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          locale: "CA",
          slug: "titol",
          status: "PUBLISHED",
          article: {
            published: true,
            editorialStatus: "PUBLISHED",
          },
        },
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        locale: "CA",
        slug: "titol",
        image: "/image.jpg",
      }),
    );
  });

  it("rend invisible une traduction absente ou non publiee", async () => {
    findFirst.mockResolvedValue(null);

    const repository =
      new PrismaPublicArticleTranslationRepository();

    await expect(
      repository.findPublishedByLocaleAndSlug("ES", "borrador"),
    ).resolves.toBeNull();
  });

  it("refuse une publication sans date de publication", async () => {
    findFirst.mockResolvedValue({
      publishedAt: null,
    });

    const repository =
      new PrismaPublicArticleTranslationRepository();

    await expect(
      repository.findPublishedByLocaleAndSlug("ES", "sin-fecha"),
    ).resolves.toBeNull();
  });
});
