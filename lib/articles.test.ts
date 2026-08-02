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
});
