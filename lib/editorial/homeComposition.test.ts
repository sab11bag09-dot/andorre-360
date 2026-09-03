import { describe, expect, it } from "vitest";

import {
  composeAutomatedHome,
  type HomeCompositionCandidate,
} from "./homeComposition";
import type {
  HomeAutomationCandidate,
  HomeCandidateScores,
} from "./homeAutomationPolicy";

function makeScores(total: number): HomeCandidateScores {
  const maximums: Array<[keyof HomeCandidateScores, number]> = [
    ["andorraImportance", 25],
    ["freshness", 20],
    ["sourceReliability", 15],
    ["populationImpact", 15],
    ["editorialQuality", 10],
    ["visualInterest", 5],
    ["originality", 5],
    ["explanatoryOrPracticalValue", 5],
  ];

  let remaining = total;

  return Object.fromEntries(
    maximums.map(([criterion, maximum]) => {
      const value = Math.min(maximum, remaining);
      remaining -= value;

      return [criterion, value];
    }),
  ) as HomeCandidateScores;
}

function makeCandidate(
  articleId: number,
  score: number,
  options: {
    category?: string;
    sourceId?: number;
    publishedAt?: Date;
    grandFormatEligible?: boolean;
    article?: Partial<HomeAutomationCandidate>;
  } = {},
): HomeCompositionCandidate {
  return {
    sourceId: options.sourceId ?? articleId,
    publishedAt:
      options.publishedAt ??
      new Date(
        `2026-09-01T${String(articleId % 24).padStart(2, "0")}:00:00.000Z`,
      ),
    grandFormatEligible: options.grandFormatEligible ?? false,
    article: {
      articleId,
      category: options.category ?? "ACTUALITÉ",
      image: `/images/article-${articleId}.jpg`,
      published: true,
      editorialStatus: "PUBLISHED",
      frenchPublished: true,
      catalanPublished: true,
      spanishPublished: true,
      sourceTrustLevel: "HIGH",
      duplicate: false,
      disguisedAdvertisement: false,
      expired: false,
      contradictorySignals: false,
      scores: makeScores(score),
      ...options.article,
    },
  };
}

describe("composeAutomatedHome", () => {
  it("préserve toujours un placement humain verrouillé", () => {
    const lockedHero = makeCandidate(1, 60);
    const automaticCandidate = makeCandidate(2, 100);

    const result = composeAutomatedHome(
      [lockedHero, automaticCandidate],
      [
        {
          zone: "hero",
          candidate: lockedHero,
        },
      ],
    );

    expect(result.placements).toContainEqual(
      expect.objectContaining({
        zone: "hero",
        articleId: 1,
        origin: "LOCKED",
      }),
    );

    expect(result.placements).not.toContainEqual(
      expect.objectContaining({
        zone: "hero",
        articleId: 2,
      }),
    );
  });

  it("ne place jamais deux fois le même article", () => {
    const candidates = Array.from({ length: 12 }, (_, index) =>
      makeCandidate(index + 1, 100 - index, {
        category: `CATÉGORIE_${index + 1}`,
      }),
    );

    const result = composeAutomatedHome(candidates);
    const articleIds = result.placements.map(({ articleId }) => articleId);

    expect(new Set(articleIds).size).toBe(articleIds.length);
  });

  it("respecte les seuils des zones automatiques", () => {
    const result = composeAutomatedHome([
      makeCandidate(1, 84),
      makeCandidate(2, 75),
      makeCandidate(3, 60),
      makeCandidate(4, 55),
    ]);

    expect(
      result.placements.find(({ zone }) => zone === "hero"),
    ).toBeUndefined();

    expect(result.placements).toContainEqual(
      expect.objectContaining({
        zone: "feature",
        articleId: 1,
      }),
    );

    expect(result.placements).toContainEqual(
      expect.objectContaining({
        zone: "card",
        articleId: 2,
      }),
    );

    expect(result.placements).toContainEqual(
      expect.objectContaining({
        zone: "brief",
        articleId: 3,
      }),
    );
  });

  it("refuse une même source pour le hero et le feature", () => {
    const result = composeAutomatedHome([
      makeCandidate(1, 100, { sourceId: 10 }),
      makeCandidate(2, 99, { sourceId: 10 }),
      makeCandidate(3, 98, { sourceId: 20 }),
    ]);

    expect(result.placements).toContainEqual(
      expect.objectContaining({
        zone: "hero",
        articleId: 1,
      }),
    );

    expect(result.placements).toContainEqual(
      expect.objectContaining({
        zone: "feature",
        articleId: 3,
      }),
    );
  });

  it("limite une catégorie à deux zones principales", () => {
    const result = composeAutomatedHome([
      makeCandidate(1, 100, {
        category: "POLITIQUE",
        sourceId: 1,
      }),
      makeCandidate(2, 99, {
        category: "POLITIQUE",
        sourceId: 2,
      }),
      makeCandidate(3, 98, {
        category: "POLITIQUE",
        sourceId: 3,
        grandFormatEligible: true,
      }),
      makeCandidate(4, 97, {
        category: "SOCIÉTÉ",
        sourceId: 4,
        grandFormatEligible: true,
      }),
    ]);

    const mainPoliticalPlacements = result.placements.filter(
      ({ category, zone }) =>
        category === "POLITIQUE" &&
        ["hero", "feature", "grand-format", "card"].includes(zone),
    );

    expect(mainPoliticalPlacements).toHaveLength(2);
  });

  it("réserve le grand format aux contenus compatibles", () => {
    const result = composeAutomatedHome([
      makeCandidate(1, 100),
      makeCandidate(2, 90, {
        grandFormatEligible: true,
      }),
    ]);

    expect(result.placements).toContainEqual(
      expect.objectContaining({
        zone: "grand-format",
        articleId: 2,
      }),
    );
  });

  it("exige un score minimal de 60 pour le grand format", () => {
    const result = composeAutomatedHome([
      makeCandidate(1, 59, {
        grandFormatEligible: true,
      }),
    ]);

    expect(result.placements.some(({ zone }) => zone === "grand-format")).toBe(
      false,
    );
  });

  it("écarte les candidats interdits même avec un score maximal", () => {
    const result = composeAutomatedHome([
      makeCandidate(1, 100, {
        article: {
          category: "ILS_EN_PARLENT",
        },
      }),
      makeCandidate(2, 90),
    ]);

    expect(result.placements.some(({ articleId }) => articleId === 1)).toBe(
      false,
    );

    expect(result.evaluations).toContainEqual(
      expect.objectContaining({
        articleId: 1,
        eligible: false,
        exclusions: ["FORBIDDEN_CATEGORY"],
      }),
    );
  });

  it("départage les scores identiques de manière déterministe", () => {
    const older = makeCandidate(1, 90, {
      publishedAt: new Date("2026-09-01T10:00:00.000Z"),
    });
    const newer = makeCandidate(2, 90, {
      publishedAt: new Date("2026-09-01T12:00:00.000Z"),
    });

    const result = composeAutomatedHome([older, newer]);

    expect(result.placements[0]).toEqual(
      expect.objectContaining({
        zone: "hero",
        articleId: 2,
      }),
    );
  });

  it("réserve le secours chronologique aux cartes et aux brèves", () => {
    const result = composeAutomatedHome([
      makeCandidate(1, 50, {
        category: "ACTUALITÉ",
        publishedAt: new Date("2026-09-01T10:00:00.000Z"),
      }),
      makeCandidate(2, 51, {
        category: "POLITIQUE",
        publishedAt: new Date("2026-09-01T12:00:00.000Z"),
      }),
      makeCandidate(3, 52, {
        category: "SOCIÉTÉ",
        publishedAt: new Date("2026-09-01T11:00:00.000Z"),
      }),
    ]);

    expect(
      result.placements.some(
        ({ zone }) => zone === "hero" || zone === "feature",
      ),
    ).toBe(false);

    expect(result.placements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          zone: "card",
          articleId: 2,
          origin: "FALLBACK",
        }),
        expect.objectContaining({
          zone: "card",
          articleId: 3,
          origin: "FALLBACK",
        }),
        expect.objectContaining({
          zone: "card",
          articleId: 1,
          origin: "FALLBACK",
        }),
      ]),
    );

    expect(result.placements.some(({ origin }) => origin === "AUTOMATED")).toBe(
      false,
    );
  });

  it("écarte des zones standard un article publié depuis plus de sept jours", () => {
    const result = composeAutomatedHome(
      [
        makeCandidate(1, 100, {
          publishedAt: new Date("2026-08-20T10:00:00.000Z"),
        }),
      ],
      [],
      {
        evaluatedAt: new Date("2026-09-03T10:00:00.000Z"),
      },
    );

    expect(result.placements).toEqual([]);
  });

  it("conserve un grand format durable malgré son ancienneté", () => {
    const result = composeAutomatedHome(
      [
        makeCandidate(1, 60, {
          grandFormatEligible: true,
          publishedAt: new Date("2026-08-01T10:00:00.000Z"),
        }),
      ],
      [],
      {
        evaluatedAt: new Date("2026-09-03T10:00:00.000Z"),
      },
    );

    expect(result.placements).toContainEqual(
      expect.objectContaining({
        zone: "grand-format",
        articleId: 1,
        origin: "AUTOMATED",
      }),
    );
  });

  it("signale les emplacements restés vides", () => {
    const result = composeAutomatedHome([]);

    expect(result.unfilledSlots).toEqual({
      hero: 1,
      feature: 1,
      "grand-format": 1,
      card: 4,
      brief: 4,
    });
  });
});
