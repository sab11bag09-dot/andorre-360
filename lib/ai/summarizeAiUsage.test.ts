import { describe, expect, it } from "vitest";

import { summarizeAiUsage, type AiUsageRow } from "./summarizeAiUsage";

// 20 novembre 2026, 18 h 00 à Andorre (UTC+1 en hiver).
const NOW = new Date("2026-11-20T17:00:00.000Z");

function row(createdAt: string, operation: string, totalTokens: number): AiUsageRow {
  return { createdAt: new Date(createdAt), operation, totalTokens };
}

describe("summarizeAiUsage", () => {
  it("compare la consommation des 24 dernières heures au plafond", () => {
    const summary = summarizeAiUsage(
      [
        row("2026-11-20T10:00:00.000Z", "article_fact_sheet", 3_000),
        row("2026-11-19T18:00:00.000Z", "article_from_facts", 2_000),
        // Plus de 24 heures : hors fenêtre du plafond.
        row("2026-11-19T16:00:00.000Z", "article_from_facts", 9_000),
      ],
      { now: NOW, limit: 10_000 },
    );

    expect(summary.window).toEqual({ used: 5_000, limit: 10_000, remaining: 5_000, percent: 50, reached: false });
  });

  it("indique le plafond atteint, sans reste négatif ni pourcentage au-delà de 100", () => {
    const summary = summarizeAiUsage([row("2026-11-20T10:00:00.000Z", "article_fact_sheet", 12_000)], {
      now: NOW,
      limit: 10_000,
    });

    expect(summary.window).toEqual({ used: 12_000, limit: 10_000, remaining: 0, percent: 100, reached: true });
  });

  it("traite un plafond nul comme atteint", () => {
    expect(summarizeAiUsage([], { now: NOW, limit: 0 }).window).toMatchObject({ percent: 100, reached: true });
  });

  it("détaille les 24 dernières heures par type d’appel, du plus coûteux au moins coûteux", () => {
    const summary = summarizeAiUsage(
      [
        row("2026-11-20T10:00:00.000Z", "article_fact_sheet", 3_000),
        row("2026-11-20T11:00:00.000Z", "article_fact_sheet", 1_000),
        row("2026-11-20T12:00:00.000Z", "article_translation", 6_000),
        row("2026-11-20T12:30:00.000Z", "operation_inconnue", 10),
      ],
      { now: NOW, limit: 100_000 },
    );

    expect(summary.byOperation).toEqual([
      { operation: "article_translation", label: "Traduction", calls: 1, tokens: 6_000 },
      { operation: "article_fact_sheet", label: "Extraction des faits", calls: 2, tokens: 4_000 },
      { operation: "operation_inconnue", label: "operation_inconnue", calls: 1, tokens: 10 },
    ]);
  });

  it("donne les 7 derniers jours, heure d’Andorre, du plus récent au plus ancien, jours vides compris", () => {
    const summary = summarizeAiUsage(
      [
        // 20 novembre à 0 h 30 à Andorre, mais encore le 19 en UTC.
        row("2026-11-19T23:30:00.000Z", "article_fact_sheet", 1_000),
        row("2026-11-20T10:00:00.000Z", "article_from_facts", 500),
        row("2026-11-18T10:00:00.000Z", "article_from_facts", 700),
        // Au-delà des 7 jours affichés.
        row("2026-11-10T10:00:00.000Z", "article_from_facts", 99_999),
      ],
      { now: NOW, limit: 100_000 },
    );

    expect(summary.byDay.map(({ day }) => day)).toEqual([
      "2026-11-20",
      "2026-11-19",
      "2026-11-18",
      "2026-11-17",
      "2026-11-16",
      "2026-11-15",
      "2026-11-14",
    ]);
    expect(summary.byDay[0]).toEqual({ day: "2026-11-20", label: "vendredi 20 novembre", calls: 2, tokens: 1_500 });
    expect(summary.byDay[1]).toMatchObject({ calls: 0, tokens: 0 });
    expect(summary.byDay[2]).toMatchObject({ calls: 1, tokens: 700 });
  });
});
