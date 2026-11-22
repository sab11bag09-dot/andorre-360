import { describe, expect, it } from "vitest";

import { assessDraftQuality, DRAFT_QUALITY_PUBLISHABLE_SCORE } from "./draftQuality";

const SOURCE = {
  name: "Govern d’Andorra",
  title: "El Govern aporta 14.400 euros a la Cort Penal Internacional",
  content:
    "El Govern ha aprovat contribucions voluntàries de 14.400 euros a favor de dos organismes internacionals. " +
    "L’Executiu contribueix amb 10.000 euros al Fons Fiduciari per a les Víctimes. " +
    "La resta es destina a beques de formació. El cost de cada beca és de 2.200 euros.",
  publishedAt: new Date("2026-11-18T09:00:00Z"),
};

const GOOD = {
  title: "Le Gouvernement accorde 14 400 euros à la justice internationale",
  description:
    "L’exécutif andorran soutient deux organismes internationaux, dont le fonds d’aide aux victimes, et finance des bourses de formation.",
  content:
    "L’exécutif andorran a validé deux contributions volontaires pour un total de 14 400 euros. " +
    "La plus importante, 10 000 euros, ira au fonds fiduciaire qui aide les victimes.\n\n" +
    "Le solde permettra de financer des bourses de formation destinées à de jeunes juristes du pays. " +
    "Chacune représente une dépense de 2 200 euros pour les finances publiques andorranes.\n\n" +
    "Cette décision s’inscrit dans l’engagement régulier de la Principauté auprès des juridictions internationales, " +
    "auxquelles elle apporte chaque année un soutien financier modeste mais constant, " +
    "avec une attention particulière portée à la formation des professionnels du droit et à l’aide aux personnes concernées.",
};

function assess(article: Partial<typeof GOOD> = {}) {
  return assessDraftQuality({
    article: { ...GOOD, ...article },
    source: SOURCE,
    generatedAt: new Date("2026-11-18T10:00:00Z"),
  });
}

describe("note de qualité d’un brouillon", () => {
  it("juge publiable un article fidèle, rédigé et propre", () => {
    const quality = assess();
    expect(quality.blockers).toEqual([]);
    expect(quality.score).toBeGreaterThanOrEqual(DRAFT_QUALITY_PUBLISHABLE_SCORE);
    expect(quality.verdict).toBe("publiable");
    expect(quality.criteria.map(({ max }) => max).reduce((a, b) => a + b, 0)).toBe(100);
  });

  it("refuse un chiffre absent de la source", () => {
    const quality = assess({ content: `${GOOD.content}\n\nLe programme existe depuis 1995.` });
    expect(quality.verdict).toBe("refusé");
    expect(quality.blockers).toEqual(["chiffres absents de la source : 1995"]);
  });

  it("refuse la reprise mot pour mot de la source", () => {
    const quality = assess({ content: `${SOURCE.content}\n\n${SOURCE.content}` });
    expect(quality.verdict).toBe("refusé");
    expect(quality.blockers.join(" ")).toContain("reprise de la source");
  });

  it("refuse un texte de remplissage ou un corps trop court", () => {
    expect(assess({ content: "Lorem ipsum dolor sit amet. ".repeat(20) }).blockers).toContain(
      "texte de remplissage (lorem ipsum)",
    );
    expect(assess({ content: "Le Gouvernement accorde 14 400 euros." }).blockers[0]).toMatch(/^corps trop court/);
  });

  it("met à revoir un article sans défaut bloquant mais mal formé", () => {
    const quality = assess({
      title: "AIDE.",
      description: "Court.",
      content: GOOD.content.replace(/\n\n/g, " ").replace("L’exécutif", "**L’exécutif**"),
    });
    expect(quality.blockers).toEqual([]);
    expect(quality.verdict).toBe("à revoir");
    const notes = quality.criteria.flatMap(({ notes }) => notes);
    expect(notes).toEqual(
      expect.arrayContaining(["titre terminé par un point", "un seul paragraphe", "mise en forme Markdown restée dans le texte"]),
    );
  });

  it("ne fait qu’un signalement léger pour les noms traduits", () => {
    const fidelity = assess().criteria.find(({ key }) => key === "fidelity")!;
    expect(fidelity.points).toBeGreaterThanOrEqual(30);
  });
});
