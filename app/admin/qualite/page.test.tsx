import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { assessDraftQuality } from "@/lib/article-engine/draftQuality";
import { summarizeDraftQuality } from "@/lib/article-engine/draftQualityReport";

const source = {
  name: "Govern d’Andorra",
  title: "El Govern aporta 14.400 euros",
  content: "El Govern aporta 14.400 euros a dos organismes. El cost de cada beca és de 2.200 euros.",
  publishedAt: new Date("2026-11-18T09:00:00Z"),
};

function entry(articleId: number, content: string) {
  return {
    articleId,
    title: `Article ${articleId}`,
    category: "POLITIQUE",
    editorialStatus: "AI_DRAFT" as const,
    sourceName: source.name,
    generatedAt: new Date("2026-11-18T10:00:00Z"),
    quality: assessDraftQuality({
      article: { title: "Le Gouvernement soutient deux organismes internationaux", description: "Chapô ".repeat(20), content },
      source,
      generatedAt: new Date("2026-11-18T10:00:00Z"),
    }),
  };
}

const ENTRIES = [
  entry(1, "Le Gouvernement accorde 14 400 euros. Le programme existe depuis 1995. ".repeat(8)),
  entry(2, "Lorem ipsum dolor sit amet. ".repeat(30)),
];

vi.mock("@/lib/article-engine/draftQualityReport", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/article-engine/draftQualityReport")>()),
  loadDraftQualityReport: async () => ENTRIES,
}));

describe("page Qualité des articles de l’IA", () => {
  it("résume les verdicts et la note moyenne", () => {
    const summary = summarizeDraftQuality(ENTRIES);
    expect(summary.total).toBe(2);
    expect(summary.verdicts.refusé).toBe(2);
    expect(summary.averageScore).toBe(Math.round((ENTRIES[0].quality.score + ENTRIES[1].quality.score) / 2));
    expect(summarizeDraftQuality([]).averageScore).toBeNull();
  });

  it("affiche chaque article avec sa note, son verdict et ses défauts bloquants", async () => {
    const { default: DraftQualityPage } = await import("./page");
    const html = renderToStaticMarkup(await DraftQualityPage());

    expect(html).toContain("Qualité des articles de l’IA");
    expect(html).toContain('href="/admin/articles/1"');
    expect(html).toContain("Bloquant : chiffres absents de la source : 1995");
    expect(html).toContain("texte de remplissage (lorem ipsum)");
    expect(html).toContain("Fidélité aux faits 0/35");
  });
});
