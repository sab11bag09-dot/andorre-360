import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { summarizeReferenceSet, toReferenceSetEntry } from "@/lib/article-engine/referenceSetReport";

vi.mock("@/actions/reference-set", () => ({
  completeReferenceSetAction: async () => {},
  saveReferenceAnnotationAction: async () => {},
  excludeReferenceCaseAction: async () => {},
}));

const SOURCE_TEXT =
  "El Govern aporta 14.400 euros a dos organismes humanitaris. El ministre Xavier Espot ha presentat l’ajut aquest dimarts.";

function row(id: number, requiredFacts: string, articleContent: string | null) {
  return {
    id,
    observationId: 100 + id,
    requiredFacts,
    forbiddenErrors: "14 000 euros",
    notes: "",
    observation: {
      title: `Observation ${id}`,
      url: `https://www.govern.ad/${id}`,
      content: SOURCE_TEXT,
      publishedAt: new Date("2026-11-18T09:00:00Z"),
      source: { name: "Govern d’Andorra", category: "Politique", organizationType: "GOVERNMENT" },
      article: articleContent
        ? {
            id: 500 + id,
            title: "Le Gouvernement accorde une aide à deux organismes humanitaires",
            description:
              "Le ministre Xavier Espot a présenté mardi une aide de 14 400 euros destinée à deux organismes humanitaires internationaux.",
            content: articleContent,
            aiRewrittenAt: new Date("2026-11-18T10:00:00Z"),
          }
        : null,
    },
  };
}

const GOOD_BODY = [
  "Le Gouvernement d’Andorre a décidé de soutenir deux organismes humanitaires actifs à l’international, a annoncé le ministre Xavier Espot lors de sa présentation de mardi.",
  "L’enveloppe totale atteint 14 400 euros et sera versée en une seule fois aux deux structures retenues, selon l’exécutif qui rappelle son engagement en faveur de la coopération et de la solidarité entre les peuples.",
].join("\n\n");

const ENTRIES = [
  toReferenceSetEntry(row(1, "14 400 euros\nXavier Espot", GOOD_BODY)),
  toReferenceSetEntry(row(2, "Croix-Rouge", GOOD_BODY)),
  toReferenceSetEntry(row(3, "", null)),
];

vi.mock("@/lib/article-engine/referenceSetReport", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/article-engine/referenceSetReport")>()),
  loadReferenceSet: async () => ENTRIES,
}));

describe("jeu de référence", () => {
  it("contrôle chaque article contre l’annotation et résume le jeu", () => {
    expect(ENTRIES[0].article?.quality.verdict).toBe("publiable");
    expect(ENTRIES[0].article?.passes).toBe(true);
    expect(ENTRIES[1].article?.check.missingFacts).toEqual(["Croix-Rouge"]);
    expect(ENTRIES[1].article?.passes).toBe(false);
    expect(ENTRIES[2].annotated).toBe(false);

    expect(summarizeReferenceSet(ENTRIES)).toEqual({
      total: 3,
      annotated: 2,
      evaluated: 2,
      passing: 1,
      targetReached: false,
    });
    expect(summarizeReferenceSet([ENTRIES[0]]).targetReached).toBe(true);
    expect(summarizeReferenceSet([]).targetReached).toBe(false);
  });

  it("affiche les observations, leur état et les faits manquants", async () => {
    const { default: ReferenceSetPage } = await import("./page");
    const html = renderToStaticMarkup(await ReferenceSetPage());

    expect(html).toContain("Jeu de référence");
    expect(html).toContain("3/30");
    expect(html).toContain("1/2");
    expect(html).toContain('href="/admin/qualite/reference/1"');
    expect(html).toContain("Faits absents de l’article : Croix-Rouge");
    expect(html).toContain("à annoter");
    expect(html).toContain("Compléter le jeu");
  });
});
