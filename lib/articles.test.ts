import { beforeEach, describe, expect, it, vi } from "vitest";

const { findMany } = vi.hoisted(() => ({
  findMany: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    article: {
      findMany,
    },
  },
}));

import { getArticlesByCategory } from "./articles";

describe("getArticlesByCategory", () => {
  beforeEach(() => {
    findMany.mockReset();
    findMany.mockResolvedValue([]);
  });

  it("classe les publications sans dépendre de leur dernière correction", async () => {
    await getArticlesByCategory("  ACTUALITÉ  ", { limit: 21 });

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

  it("charge une page plus ancienne sans reprendre le contenu épinglé", async () => {
    const cursor = {
      publishedAt: new Date("2026-08-02T08:00:00.000Z"),
      createdAt: new Date("2026-08-02T07:00:00.000Z"),
      id: 42,
    };

    await getArticlesByCategory("ACTUALITÉ", {
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

  it("refuse deux bornes chronologiques simultanées", async () => {
    const cursor = {
      publishedAt: new Date("2026-08-02T08:00:00.000Z"),
      createdAt: new Date("2026-08-02T07:00:00.000Z"),
      id: 42,
    };

    await expect(
      getArticlesByCategory("ACTUALITÉ", {
        before: cursor,
        after: cursor,
      }),
    ).rejects.toThrow("Une seule borne chronologique peut être utilisée.");
  });
});
