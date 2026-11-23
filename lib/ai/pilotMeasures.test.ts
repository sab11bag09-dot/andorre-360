import { describe, expect, it } from "vitest";

import { aiCallCostUsd } from "./aiPrices";
import { summarizePilot, type PilotArticleRow, type PilotUsageRow } from "./pilotMeasures";

// Lundi 23 novembre 2026, 20 h à Andorre.
const NOW = new Date("2026-11-23T19:00:00.000Z");
const MONDAY = new Date("2026-11-23T09:00:00.000Z");
const SUNDAY = new Date("2026-11-22T09:00:00.000Z");

function article(overrides: Partial<PilotArticleRow> & Pick<PilotArticleRow, "id">): PilotArticleRow {
  return {
    category: "POLITIQUE",
    generatedAt: MONDAY,
    publishedAt: null,
    sourcePublishedAt: null,
    qualityVerdict: "publiable",
    namesToCheck: 0,
    textEdited: false,
    observationIds: [overrides.id * 10],
    ...overrides,
  };
}

function usage(overrides: Partial<PilotUsageRow>): PilotUsageRow {
  return {
    createdAt: MONDAY,
    model: "gpt-5.6-terra",
    operation: "article_from_facts",
    inputTokens: 1_000_000,
    outputTokens: 0,
    observationId: null,
    articleId: null,
    ...overrides,
  };
}

describe("prix des appels", () => {
  it("estime le coût d’un modèle connu, et rien pour un modèle inconnu", () => {
    expect(aiCallCostUsd("gpt-5.6-terra", 1_000_000, 500_000)).toBe(8);
    expect(aiCallCostUsd("modele-inconnu", 1_000, 1_000)).toBeNull();
  });
});

describe("mesures du pilote", () => {
  it("compte les articles du jour, par rubrique, publiables, publiés et retouchés", () => {
    const measures = summarizePilot(
      [
        article({ id: 1, publishedAt: new Date("2026-11-23T15:00:00.000Z"), sourcePublishedAt: MONDAY }),
        article({
          id: 2,
          category: "SPORTS",
          qualityVerdict: "à revoir",
          namesToCheck: 2,
          textEdited: true,
          publishedAt: new Date("2026-11-23T13:00:00.000Z"),
          sourcePublishedAt: MONDAY,
        }),
        article({ id: 3, generatedAt: SUNDAY }),
      ],
      [],
      { now: NOW, days: 3 },
    );

    const [monday, sunday, saturday] = measures.days;
    expect(monday).toMatchObject({
      day: "2026-11-23",
      produced: 2,
      publishable: 1,
      published: 2,
      publishedUnedited: 1,
      withNamesToCheck: 1,
      // Délais de 6 h et 4 h.
      medianDelayHours: 5,
    });
    expect(monday.byCategory).toEqual([
      { category: "POLITIQUE", count: 1 },
      { category: "SPORTS", count: 1 },
    ]);
    expect(sunday).toMatchObject({ day: "2026-11-22", produced: 1, published: 0, medianDelayHours: null });
    expect(saturday.produced).toBe(0);
    expect(measures.total).toMatchObject({ produced: 3, publishable: 2, published: 2 });
  });

  it("rattache à chaque article ses appels, même anciens, traductions comprises", () => {
    const measures = summarizePilot(
      [article({ id: 1 }), article({ id: 2 })],
      [
        // Article 1 : rédaction (2 $), ancienne rédaction (2 $) et traduction (2 $).
        usage({ observationId: 10 }),
        usage({ observationId: 10, createdAt: new Date("2026-10-01T09:00:00.000Z") }),
        usage({ articleId: 1, operation: "article_translation" }),
        // Article 2 : rédaction (2 $).
        usage({ observationId: 20 }),
        // Génération refusée : l’observation 99 n’a pas d’article.
        usage({ observationId: 99 }),
        usage({ observationId: 99, operation: "article_fact_sheet" }),
      ],
      { now: NOW, days: 1 },
    );

    expect(measures.total.costPerArticleUsd).toBe(4);
    // Le coût de la période ne compte que les appels du jour.
    expect(measures.total.costUsd).toBe(10);
    expect(measures.total.refusedGenerations).toBe(1);
    expect(measures.total.costIncomplete).toBe(false);
  });

  it("signale un coût incomplet et n’invente pas de coût sans appel rattaché", () => {
    const measures = summarizePilot(
      [article({ id: 1 })],
      [usage({ model: "modele-inconnu" }), usage({})],
      { now: NOW, days: 1 },
    );

    expect(measures.total.costUsd).toBe(2);
    expect(measures.total.costIncomplete).toBe(true);
    expect(measures.total.costPerArticleUsd).toBeNull();
  });
});
