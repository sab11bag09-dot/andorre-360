import { beforeEach, describe, expect, it, vi } from "vitest";

const { findMany } = vi.hoisted(() => ({
  findMany: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    publication: {
      findMany,
    },
  },
}));

import { loadLockedHomePlacements } from "./loadLockedHomePlacements";

function makePublication(
  id: number,
  options: {
    zone?: string;
    articleId?: number;
    priority?: number;
    startsAt?: Date | null;
    endsAt?: Date | null;
    updatedAt?: Date;
    sourceId?: number | null;
  } = {},
) {
  const articleId = options.articleId ?? id;
  const sourceId =
    options.sourceId === undefined ? articleId : options.sourceId;

  return {
    id,
    zone: options.zone ?? "hero",
    priority: options.priority ?? 20,
    startsAt: options.startsAt ?? null,
    endsAt: options.endsAt ?? null,
    updatedAt: options.updatedAt ?? new Date("2026-09-03T08:00:00.000Z"),
    article: {
      id: articleId,
      title: `Article ${articleId}`,
      category: "ACTUALITÉ",
      author: "Rédaction",
      observations:
        sourceId === null
          ? []
          : [
              {
                source: {
                  id: sourceId,
                  name: `Source ${sourceId}`,
                },
              },
            ],
    },
  };
}

describe("loadLockedHomePlacements", () => {
  beforeEach(() => {
    findMany.mockReset();
    findMany.mockResolvedValue([]);
  });

  it("recherche les publications verrouillées ou manuelles de l’accueil", async () => {
    await loadLockedHomePlacements({
      evaluatedAt: new Date("2026-09-03T10:00:00.000Z"),
    });

    expect(findMany).toHaveBeenCalledTimes(1);

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          pageKey: "home",
          channel: "site",
          active: true,
          OR: [{ locked: true }, { origin: "MANUAL" }],
          zone: {
            in: ["hero", "feature", "grand-format", "card", "brief"],
          },
          article: expect.objectContaining({
            published: true,
            editorialStatus: "PUBLISHED",
            category: {
              not: "ILS_EN_PARLENT",
            },
          }),
        }),
        select: expect.objectContaining({
          id: true,
          zone: true,
          priority: true,
          startsAt: true,
          endsAt: true,
          updatedAt: true,
        }),
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }, { id: "desc" }],
      }),
    );

    expect(findMany.mock.calls[0][0].where).not.toHaveProperty("locked");
  });

  it("utilise le client transactionnel fourni sans consulter le client global", async () => {
    const transactionFindMany = vi
      .fn()
      .mockResolvedValue([makePublication(42)]);

    // Le double de test expose uniquement la méthode utilisée.
    const transactionClient = {
      publication: {
        findMany: transactionFindMany,
      },
    } as unknown as NonNullable<Parameters<typeof loadLockedHomePlacements>[1]>;

    const placements = await loadLockedHomePlacements(
      {
        evaluatedAt: new Date("2026-09-03T10:00:00.000Z"),
      },
      transactionClient,
    );

    expect(transactionFindMany).toHaveBeenCalledTimes(1);
    expect(findMany).not.toHaveBeenCalled();

    expect(placements).toEqual([
      {
        publicationId: 42,
        priority: 20,
        startsAt: null,
        endsAt: null,
        updatedAt: new Date("2026-09-03T08:00:00.000Z"),
        zone: "hero",
        articleId: 42,
        title: "Article 42",
        category: "ACTUALITÉ",
        sourceId: 42,
        sourceName: "Source 42",
      },
    ]);
  });

  it("conserve les priorités et dates nécessaires à la comparaison", async () => {
    const startsAt = new Date("2026-09-03T07:00:00.000Z");
    const endsAt = new Date("2026-09-04T07:00:00.000Z");
    const updatedAt = new Date("2026-09-03T09:00:00.000Z");

    findMany.mockResolvedValue([
      makePublication(1, {
        priority: 35,
        startsAt,
        endsAt,
        updatedAt,
      }),
    ]);

    const placements = await loadLockedHomePlacements({
      evaluatedAt: new Date("2026-09-03T10:00:00.000Z"),
    });

    expect(placements).toHaveLength(1);
    expect(placements[0]).toEqual(
      expect.objectContaining({
        publicationId: 1,
        priority: 35,
        startsAt,
        endsAt,
        updatedAt,
      }),
    );
  });

  it("ignore les publications futures ou terminées", async () => {
    findMany.mockResolvedValue([
      makePublication(1, {
        startsAt: new Date("2026-09-03T11:00:00.000Z"),
      }),
      makePublication(2, {
        endsAt: new Date("2026-09-03T09:00:00.000Z"),
      }),
      makePublication(3),
    ]);

    const placements = await loadLockedHomePlacements({
      evaluatedAt: new Date("2026-09-03T10:00:00.000Z"),
    });

    expect(placements.map(({ articleId }) => articleId)).toEqual([3]);
  });

  it("respecte les capacités et ne conserve jamais deux fois le même article", async () => {
    findMany.mockResolvedValue([
      makePublication(1, {
        zone: "hero",
        articleId: 10,
      }),
      makePublication(2, {
        zone: "hero",
        articleId: 20,
      }),
      makePublication(3, {
        zone: "card",
        articleId: 10,
      }),
      makePublication(4, {
        zone: "card",
        articleId: 30,
      }),
      makePublication(5, {
        zone: "card",
        articleId: 40,
      }),
      makePublication(6, {
        zone: "card",
        articleId: 50,
      }),
      makePublication(7, {
        zone: "card",
        articleId: 60,
      }),
      makePublication(8, {
        zone: "card",
        articleId: 70,
      }),
    ]);

    const placements = await loadLockedHomePlacements();

    expect(placements.map(({ publicationId }) => publicationId)).toEqual([
      1, 4, 5, 6, 7,
    ]);

    expect(placements.filter(({ zone }) => zone === "hero")).toHaveLength(1);
    expect(placements.filter(({ zone }) => zone === "card")).toHaveLength(4);

    expect(new Set(placements.map(({ articleId }) => articleId)).size).toBe(
      placements.length,
    );
  });

  it("utilise l’auteur lorsqu’aucune source n’est reliée à l’article", async () => {
    findMany.mockResolvedValue([
      makePublication(1, {
        sourceId: null,
      }),
    ]);

    await expect(loadLockedHomePlacements()).resolves.toEqual([
      {
        publicationId: 1,
        priority: 20,
        startsAt: null,
        endsAt: null,
        updatedAt: new Date("2026-09-03T08:00:00.000Z"),
        zone: "hero",
        articleId: 1,
        title: "Article 1",
        category: "ACTUALITÉ",
        sourceId: null,
        sourceName: "Rédaction",
      },
    ]);
  });
});
