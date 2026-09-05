import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Prisma } from "@/lib/generated/prisma/client";

import type { HomeCompositionPlacement } from "./homeComposition";
import type { LockedHomePublication } from "./loadLockedHomePlacements";
import type { MutableHomePublicationSnapshot } from "./loadMutableHomePublications";
import { writeAutomatedHomeComposition } from "./writeAutomatedHomeComposition";

const appliedAt = new Date("2026-09-05T10:00:00.000Z");

function makePlacement(
  overrides: Partial<HomeCompositionPlacement> = {},
): HomeCompositionPlacement {
  return {
    zone: "card",
    articleId: 42,
    sourceId: 5,
    category: "ACTUALITÉ",
    score: 80,
    origin: "AUTOMATED",
    ...overrides,
  };
}

function makeLockedPlacement(
  overrides: Partial<LockedHomePublication> = {},
): LockedHomePublication {
  return {
    publicationId: 10,
    articleId: 1,
    zone: "hero",
    priority: 20,
    startsAt: null,
    endsAt: null,
    updatedAt: new Date("2026-09-05T08:00:00.000Z"),
    title: "Article humain",
    category: "POLITIQUE",
    sourceId: 2,
    sourceName: "Source humaine",
    ...overrides,
  };
}

function makeMutablePublication(
  overrides: Partial<MutableHomePublicationSnapshot> = {},
): MutableHomePublicationSnapshot {
  return {
    publicationId: 20,
    articleId: 30,
    channel: "site",
    pageKey: "home",
    zone: "card",
    priority: 10,
    startsAt: new Date("2026-09-04T10:00:00.000Z"),
    endsAt: null,
    active: true,
    origin: "AUTOMATED",
    locked: false,
    automationScore: 75,
    automationPolicyVersion: "1.0",
    automationRunId: "ancien-run",
    updatedAt: new Date("2026-09-04T10:00:00.000Z"),
    ...overrides,
  };
}

describe("écriture d’une composition automatique de l’accueil", () => {
  const articleFindMany = vi.fn();
  const publicationUpdateMany = vi.fn();
  const publicationCreate = vi.fn();

  const transaction = {
    article: {
      findMany: articleFindMany,
    },
    publication: {
      updateMany: publicationUpdateMany,
      create: publicationCreate,
    },
  } as unknown as Pick<Prisma.TransactionClient, "article" | "publication">;

  beforeEach(() => {
    vi.resetAllMocks();

    articleFindMany.mockImplementation(
      async (query: { where: { id: { in: number[] } } }) =>
        query.where.id.in.map((id) => ({ id })),
    );

    publicationUpdateMany.mockResolvedValue({
      count: 1,
    });

    let nextPublicationId = 100;

    publicationCreate.mockImplementation(async () => ({
      id: nextPublicationId++,
    }));
  });

  it("préserve les choix humains et écrit les placements IA", async () => {
    const lockedPlacement = makeLockedPlacement();

    const result = await writeAutomatedHomeComposition(transaction, {
      runId: "run-123",
      policyVersion: "1.1",
      appliedAt,
      lockedPlacements: [lockedPlacement],
      mutablePublications: [makeMutablePublication()],
      placements: [
        {
          zone: lockedPlacement.zone,
          articleId: lockedPlacement.articleId,
          sourceId: lockedPlacement.sourceId,
          category: lockedPlacement.category,
          score: 0,
          origin: "LOCKED",
        },
        makePlacement({
          zone: "card",
          articleId: 42,
          origin: "AUTOMATED",
          score: 90,
        }),
        makePlacement({
          zone: "brief",
          articleId: 43,
          origin: "FALLBACK",
          score: 55,
        }),
      ],
    });

    expect(articleFindMany).toHaveBeenCalledWith({
      where: expect.objectContaining({
        id: {
          in: [42, 43],
        },
        published: true,
        editorialStatus: "PUBLISHED",
        category: {
          not: "ILS_EN_PARLENT",
        },
      }),
      select: {
        id: true,
      },
    });

    expect(publicationUpdateMany).toHaveBeenCalledWith({
      where: {
        id: {
          in: [20],
        },
        pageKey: "home",
        channel: "site",
        active: true,
        locked: false,
        origin: {
          in: ["AUTOMATED", "FALLBACK"],
        },
      },
      data: {
        active: false,
        endsAt: appliedAt,
      },
    });

    expect(publicationCreate).toHaveBeenNthCalledWith(1, {
      data: {
        articleId: 42,
        pageKey: "home",
        channel: "site",
        zone: "card",
        priority: 10,
        startsAt: appliedAt,
        endsAt: null,
        active: true,
        origin: "AUTOMATED",
        locked: false,
        automationScore: 90,
        automationPolicyVersion: "1.1",
        automationRunId: "run-123",
      },
      select: {
        id: true,
      },
    });

    expect(publicationCreate).toHaveBeenNthCalledWith(2, {
      data: {
        articleId: 43,
        pageKey: "home",
        channel: "site",
        zone: "brief",
        priority: 10,
        startsAt: appliedAt,
        endsAt: null,
        active: true,
        origin: "FALLBACK",
        locked: false,
        automationScore: 55,
        automationPolicyVersion: "1.1",
        automationRunId: "run-123",
      },
      select: {
        id: true,
      },
    });

    expect(result).toEqual({
      createdPublicationIds: [100, 101],
      disabledPublicationIds: [20],
      preservedLockedPublicationIds: [10],
      placements: [
        {
          publicationId: 100,
          articleId: 42,
          zone: "card",
          score: 90,
          origin: "AUTOMATED",
        },
        {
          publicationId: 101,
          articleId: 43,
          zone: "brief",
          score: 55,
          origin: "FALLBACK",
        },
      ],
    });
  });

  it("place les cartes automatiques après une carte humaine", async () => {
    const lockedCard = makeLockedPlacement({
      publicationId: 11,
      articleId: 2,
      zone: "card",
      priority: 20,
    });

    await writeAutomatedHomeComposition(transaction, {
      runId: "run-123",
      policyVersion: "1.1",
      appliedAt,
      lockedPlacements: [lockedCard],
      mutablePublications: [],
      placements: [
        {
          zone: "card",
          articleId: 2,
          sourceId: 2,
          category: "POLITIQUE",
          score: 0,
          origin: "LOCKED",
        },
        makePlacement({
          articleId: 42,
          zone: "card",
        }),
        makePlacement({
          articleId: 43,
          zone: "card",
        }),
      ],
    });

    expect(publicationUpdateMany).not.toHaveBeenCalled();

    expect(publicationCreate).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        data: expect.objectContaining({
          articleId: 42,
          priority: 19,
        }),
      }),
    );

    expect(publicationCreate).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        data: expect.objectContaining({
          articleId: 43,
          priority: 18,
        }),
      }),
    );
  });

  it("laisse volontairement une zone vide en retirant son ancien placement automatique", async () => {
    const result = await writeAutomatedHomeComposition(transaction, {
      runId: "run-empty",
      policyVersion: "1.1",
      appliedAt,
      lockedPlacements: [],
      mutablePublications: [makeMutablePublication()],
      placements: [],
    });

    expect(articleFindMany).not.toHaveBeenCalled();
    expect(publicationUpdateMany).toHaveBeenCalledTimes(1);
    expect(publicationCreate).not.toHaveBeenCalled();

    expect(result).toEqual({
      createdPublicationIds: [],
      disabledPublicationIds: [20],
      preservedLockedPublicationIds: [],
      placements: [],
    });
  });

  it("ne tente aucune désactivation lorsqu’il n’existe aucun ancien placement automatique", async () => {
    await writeAutomatedHomeComposition(transaction, {
      runId: "run-new",
      policyVersion: "1.1",
      appliedAt,
      lockedPlacements: [],
      mutablePublications: [],
      placements: [makePlacement()],
    });

    expect(publicationUpdateMany).not.toHaveBeenCalled();
    expect(publicationCreate).toHaveBeenCalledTimes(1);
  });

  it("refuse un article devenu non admissible avant toute écriture", async () => {
    articleFindMany.mockResolvedValue([]);

    await expect(
      writeAutomatedHomeComposition(transaction, {
        runId: "run-invalid",
        policyVersion: "1.1",
        appliedAt,
        lockedPlacements: [],
        mutablePublications: [makeMutablePublication()],
        placements: [
          makePlacement({
            articleId: 99,
          }),
        ],
      }),
    ).rejects.toThrow("L’article 99 n’est plus admissible à la publication.");

    expect(publicationUpdateMany).not.toHaveBeenCalled();
    expect(publicationCreate).not.toHaveBeenCalled();
  });

  it("refuse une modification concurrente des anciennes publications", async () => {
    publicationUpdateMany.mockResolvedValue({
      count: 0,
    });

    await expect(
      writeAutomatedHomeComposition(transaction, {
        runId: "run-concurrent",
        policyVersion: "1.1",
        appliedAt,
        lockedPlacements: [],
        mutablePublications: [makeMutablePublication()],
        placements: [makePlacement()],
      }),
    ).rejects.toThrow(
      "Les publications automatiques ont changé pendant l’application.",
    );

    expect(publicationCreate).not.toHaveBeenCalled();
  });

  it("refuse une composition qui ne contient plus le choix humain", async () => {
    await expect(
      writeAutomatedHomeComposition(transaction, {
        runId: "run-missing-lock",
        policyVersion: "1.1",
        appliedAt,
        lockedPlacements: [makeLockedPlacement()],
        mutablePublications: [],
        placements: [makePlacement()],
      }),
    ).rejects.toThrow(
      "La composition ne correspond pas aux sélections humaines protégées.",
    );

    expect(articleFindMany).not.toHaveBeenCalled();
    expect(publicationUpdateMany).not.toHaveBeenCalled();
    expect(publicationCreate).not.toHaveBeenCalled();
  });

  it("refuse qu’un article apparaisse plusieurs fois", async () => {
    await expect(
      writeAutomatedHomeComposition(transaction, {
        runId: "run-duplicate",
        policyVersion: "1.1",
        appliedAt,
        lockedPlacements: [],
        mutablePublications: [],
        placements: [
          makePlacement({
            zone: "card",
            articleId: 42,
          }),
          makePlacement({
            zone: "brief",
            articleId: 42,
          }),
        ],
      }),
    ).rejects.toThrow(
      "L’article 42 apparaît plusieurs fois dans la composition.",
    );

    expect(articleFindMany).not.toHaveBeenCalled();
    expect(publicationUpdateMany).not.toHaveBeenCalled();
    expect(publicationCreate).not.toHaveBeenCalled();
  });

  it("refuse le dépassement de capacité d’une zone", async () => {
    const placements = Array.from({ length: 6 }, (_, index) =>
      makePlacement({
        zone: "card",
        articleId: index + 1,
      }),
    );

    await expect(
      writeAutomatedHomeComposition(transaction, {
        runId: "run-capacity",
        policyVersion: "1.1",
        appliedAt,
        lockedPlacements: [],
        mutablePublications: [],
        placements,
      }),
    ).rejects.toThrow("La zone card dépasse sa capacité de 5.");

    expect(articleFindMany).not.toHaveBeenCalled();
    expect(publicationUpdateMany).not.toHaveBeenCalled();
    expect(publicationCreate).not.toHaveBeenCalled();
  });
});
