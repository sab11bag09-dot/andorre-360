import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { summarizePilot } from "@/lib/ai/pilotMeasures";

const NOW = new Date("2026-11-23T19:00:00.000Z");

vi.mock("next/server", () => ({ connection: async () => undefined }));
vi.mock("@/lib/ai/loadPilotMeasures", () => ({
  loadPilotMeasures: async () =>
    summarizePilot(
      [
        {
          id: 1,
          category: "ILS_EN_PARLENT",
          generatedAt: new Date("2026-11-23T09:00:00.000Z"),
          publishedAt: new Date("2026-11-23T12:00:00.000Z"),
          sourcePublishedAt: new Date("2026-11-23T09:00:00.000Z"),
          qualityVerdict: "publiable",
          namesToCheck: 1,
          textEdited: false,
          observationIds: [10],
        },
      ],
      [
        {
          createdAt: new Date("2026-11-23T09:00:00.000Z"),
          model: "gpt-5.6-terra",
          operation: "article_from_facts",
          inputTokens: 10_000,
          outputTokens: 1_000,
          observationId: 10,
          articleId: null,
        },
      ],
      { now: NOW },
    ),
}));

describe("page Mesures du pilote", () => {
  it("affiche les mesures de la période, jour par jour et par rubrique", async () => {
    const { default: PilotMeasuresPage } = await import("./page");
    const html = renderToStaticMarkup(await PilotMeasuresPage());

    expect(html).toContain("Mesures du pilote");
    expect(html).toContain("1 sur 1");
    // 10 000 jetons d’entrée à 2 $ et 1 000 de sortie à 12 $ le million.
    expect(html).toContain("0,032");
    expect(html).toContain("3 h");
    expect(html).toContain("ILS EN PARLENT");
    expect(html).toContain("Jour par jour");
  });
});
