import { beforeEach, describe, expect, it, vi } from "vitest";

const { findMany, findFirst } = vi.hoisted(() => ({
  findMany: vi.fn(),
  findFirst: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    article: {
      findMany,
      findFirst,
    },
  },
}));

import {
  getArticleBySlug,
  getArticlesByCategory,
  getFeaturedArticle,
  getFilInfoArticles,
  getPublishedArticles,
} from "./articles";

describe("requêtes publiques des articles", () => {
  beforeEach(() => {
    findMany.mockReset();
    findFirst.mockReset();
    findMany.mockResolvedValue([]);
    findFirst.mockResolvedValue(null);
  });

  it("applique la barrière commune et une limite aux articles généraux", async () => {
    await getPublishedArticles();

    expect(findMany).toHaveBeenCalledWith({
      where: {
        published: true,
        editorialStatus: "PUBLISHED",
      },
      orderBy: [
        { publishedAt: "desc" },
        { createdAt: "desc" },
        { id: "desc" },
      ],
      take: 50,
    });
  });

  it("garde les rubriques indépendantes de la visibilité du Fil info", async () => {
    await getArticlesByCategory("  ACTUALITÉ  ", { limit: 21 });

    expect(findMany).toHaveBeenCalledWith({
      where: {
        category: "ACTUALITÉ",
        published: true,
        editorialStatus: "PUBLISHED",
      },
      orderBy: [
        { publishedAt: "desc" },
        { createdAt: "desc" },
        { id: "desc" },
      ],
      take: 21,
    });
  });

  it("borne une rubrique lorsqu’aucune limite n’est fournie", async () => {
    await getArticlesByCategory("SOCIÉTÉ");

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 50 }),
    );
  });

  it.each([0, -1, 1.5])("refuse la limite invalide %s", async (limit) => {
    await expect(
      getArticlesByCategory("ACTUALITÉ", { limit }),
    ).rejects.toThrow("La limite doit être un entier positif.");

    expect(findMany).not.toHaveBeenCalled();
  });

  it("refuse une catégorie vide", async () => {
    await expect(getArticlesByCategory("   ")).rejects.toThrow(
      "La catégorie est obligatoire.",
    );

    expect(findMany).not.toHaveBeenCalled();
  });

  it("réserve filInfoVisible et l’épinglage à la requête du Fil info", async () => {
    await getFilInfoArticles("ACTUALITÉ", { limit: 21 });

    expect(findMany).toHaveBeenCalledWith({
      where: {
        category: "ACTUALITÉ",
        published: true,
        editorialStatus: "PUBLISHED",
        filInfoVisible: true,
      },
      orderBy: [
        { filInfoPinned: "desc" },
        { publishedAt: "desc" },
        { createdAt: "desc" },
        { id: "desc" },
      ],
      take: 21,
    });
  });

  it("charge une page du Fil info sans reprendre le contenu épinglé", async () => {
    const cursor = {
      publishedAt: new Date("2026-08-02T08:00:00.000Z"),
      createdAt: new Date("2026-08-02T07:00:00.000Z"),
      id: 42,
    };

    await getFilInfoArticles("ACTUALITÉ", {
      limit: 21,
      before: cursor,
      prioritizePinned: false,
      excludePinned: true,
    });

    expect(findMany).toHaveBeenCalledWith({
      where: {
        category: "ACTUALITÉ",
        published: true,
        editorialStatus: "PUBLISHED",
        filInfoVisible: true,
        filInfoPinned: false,
        AND: {
          OR: [
            { publishedAt: { lt: cursor.publishedAt } },
            {
              publishedAt: cursor.publishedAt,
              createdAt: { lt: cursor.createdAt },
            },
            {
              publishedAt: cursor.publishedAt,
              createdAt: cursor.createdAt,
              id: { lt: cursor.id },
            },
          ],
        },
      },
      orderBy: [
        { publishedAt: "desc" },
        { createdAt: "desc" },
        { id: "desc" },
      ],
      take: 21,
    });
  });

  it("refuse deux bornes du Fil info simultanées", async () => {
    const cursor = {
      publishedAt: new Date("2026-08-02T08:00:00.000Z"),
      createdAt: new Date("2026-08-02T07:00:00.000Z"),
      id: 42,
    };

    await expect(
      getFilInfoArticles("ACTUALITÉ", {
        before: cursor,
        after: cursor,
      }),
    ).rejects.toThrow("Une seule borne chronologique peut être utilisée.");
  });

  it("rend la fiche française inaccessible hors de la règle publique", async () => {
    await getArticleBySlug("article-test");

    expect(findFirst).toHaveBeenCalledWith({
      where: {
        slug: "article-test",
        published: true,
        editorialStatus: "PUBLISHED",
      },
    });
  });

  it("exclut une Une qui n’est pas intégralement publiée", async () => {
    await getFeaturedArticle();

    expect(findFirst).toHaveBeenCalledWith({
      where: {
        featured: true,
        published: true,
        editorialStatus: "PUBLISHED",
      },
      orderBy: [
        { publishedAt: "desc" },
        { createdAt: "desc" },
        { id: "desc" },
      ],
    });
  });
});
