import { describe, expect, it } from "vitest";

import {
  checkAgainstReference,
  textContainsExpression,
  isReferenceAnnotated,
  looksLikeArticle,
  parseReferenceLines,
  referenceFingerprints,
  REFERENCE_SET_SIZE,
  selectReferenceObservations,
  textStatesFact,
  type ReferenceCandidate,
} from "./referenceSet";

const ARTICLE = {
  title: "Le Gouvernement accorde 14 400 euros à deux organismes",
  description: "Xavier Espot a présenté l’aide aux associations humanitaires.",
  content: "L’aide du Govern s’élève à 14.400 euros. Le coût de chaque bourse atteint 2,5 millions.",
};

const EMPTY = { whoFacts: "", whereFacts: "", whenFacts: "", howFacts: "", whyFacts: "", forbiddenErrors: "" };

describe("faits du jeu de référence", () => {
  it("lit un fait par ligne, sans puces ni lignes vides", () => {
    expect(parseReferenceLines("- 14 400 euros\n\n• Xavier Espot\n  ")).toEqual(["14 400 euros", "Xavier Espot"]);
  });

  it("reconnaît un fait quels que soient accents, majuscules, séparateurs de milliers et pluriels", () => {
    expect(textStatesFact(ARTICLE.content, "14 400 euros")).toBe(true);
    expect(textStatesFact(ARTICLE.title, "14.400 euros")).toBe(true);
    expect(textStatesFact(ARTICLE.title, "14 000 euros")).toBe(false);
    expect(textStatesFact(ARTICLE.title, "gouvernement")).toBe(true);
    expect(textStatesFact(ARTICLE.title, "organisme")).toBe(true);
    expect(textStatesFact(ARTICLE.content, "2,5 millions")).toBe(true);
    expect(textStatesFact(ARTICLE.content, "2 millions")).toBe(false);
  });

  it("reconnaît les nombres écrits en lettres et les mots de même racine", () => {
    const text = "Douze nouveaux conseillers ont prêté serment. Chaque conseiller votera pour deux initiatives. Noa Godoy, cinquième de la finale.";
    expect(textStatesFact(text, "12 conseillers")).toBe(true);
    expect(textStatesFact(text, "vote")).toBe(true);
    expect(textStatesFact(text, "2 initiatives")).toBe(true);
    expect(textStatesFact(text, "5e")).toBe(true);
    expect(textStatesFact(text, "5ème")).toBe(true);
    expect(textStatesFact(text, "13 conseillers")).toBe(false);
    expect(textStatesFact(text, "quatrième")).toBe(false);
  });

  it("accepte des formulations équivalentes séparées par « | »", () => {
    expect(textStatesFact(ARTICLE.description, "Govern | Xavier Espot")).toBe(true);
    expect(textStatesFact(ARTICLE.description, "Govern | Consell General")).toBe(false);
  });

  it("ignore les mots vides : un fait sans mot clé n’est jamais satisfait", () => {
    expect(textStatesFact(ARTICLE.content, "les des")).toBe(false);
  });

  it("contrôle un article contre l’annotation, question par question", () => {
    const check = checkAgainstReference(ARTICLE, {
      ...EMPTY,
      whoFacts: "Xavier Espot\nCroix-Rouge",
      howFacts: "14 400 euros",
      forbiddenErrors: "14 000 euros\nConsell General",
    });
    expect(check.missingFacts).toEqual(["Qui ou quoi ? Croix-Rouge"]);
    expect(check.forbiddenFound).toEqual([]);
    expect(check.conforms).toBe(false);
    expect(check.questions.map(({ key, facts, missing }) => [key, facts.length, missing])).toEqual([
      ["who", 2, ["Croix-Rouge"]],
      ["where", 0, []],
      ["when", 0, []],
      ["how", 1, []],
      ["why", 0, []],
    ]);

    const wrong = checkAgainstReference(ARTICLE, { ...EMPTY, whoFacts: "Xavier Espot", forbiddenErrors: "2,5 millions" });
    expect(wrong.forbiddenFound).toEqual(["2,5 millions"]);
    expect(wrong.conforms).toBe(false);

    expect(checkAgainstReference(ARTICLE, { ...EMPTY, whoFacts: "Xavier Espot" }).conforms).toBe(true);
  });

  it("cherche une erreur interdite comme une expression, pas comme des mots épars", () => {
    const text = "Le marché ouvre jusqu’au 20 décembre. L’entrée coûte 5 euros. Le groupe social-démocrate approuve.";
    expect(textContainsExpression(text, "20 euros")).toBe(false);
    expect(textContainsExpression(text, "5 euros")).toBe(true);
    expect(textContainsExpression(text, "Demòcrates per Andorra")).toBe(false);
    expect(textContainsExpression("Demòcrates per Andorra s’abstient.", "Demòcrates per Andorra | DA")).toBe(true);
  });

  it("une observation est annotée dès qu’une question a un fait", () => {
    expect(isReferenceAnnotated({ ...EMPTY, whoFacts: "  \n", forbiddenErrors: "14 000 euros" })).toBe(false);
    expect(isReferenceAnnotated({ ...EMPTY, whyFacts: "solidarité" })).toBe(true);
  });
});

let nextId = 1;
function candidate(overrides: Partial<ReferenceCandidate>): ReferenceCandidate {
  const id = nextId++;
  return {
    id,
    sourceId: 1,
    category: "Société",
    organizationType: "GOVERNMENT",
    title: `Le Comú présente le projet numéro ${id}`,
    content: `Texte ${id} ${"mot ".repeat(300)}`,
    publishedAt: new Date(Date.UTC(2026, 10, 1) + id * 60_000),
    collectedAt: new Date("2026-11-20T00:00:00Z"),
    ...overrides,
  };
}

describe("composition automatique du jeu", () => {
  it("répartit les observations à tour de rôle entre rubriques et types de source", () => {
    const pool = [
      ...Array.from({ length: 50 }, () => candidate({ category: "Actualité", organizationType: "MEDIA" })),
      ...Array.from({ length: 3 }, () => candidate({ category: "Sports", organizationType: "SPORTS_CLUB" })),
      ...Array.from({ length: 50 }, () => candidate({ category: "Politique", organizationType: "GOVERNMENT" })),
    ];
    const selected = selectReferenceObservations(pool);
    const byGroup = (category: string) =>
      selected.filter((id) => pool.find((item) => item.id === id)?.category === category).length;

    expect(selected).toHaveLength(REFERENCE_SET_SIZE);
    expect(byGroup("Sports")).toBe(3);
    expect(byGroup("Actualité")).toBeGreaterThanOrEqual(13);
    expect(byGroup("Politique")).toBeGreaterThanOrEqual(13);
  });

  it("varie les sources et prend les plus récentes d’abord", () => {
    const old = candidate({ sourceId: 1, publishedAt: new Date("2026-01-01T00:00:00Z") });
    const recentA = candidate({ sourceId: 1, publishedAt: new Date("2026-11-20T00:00:00Z") });
    const recentA2 = candidate({ sourceId: 1, publishedAt: new Date("2026-11-19T00:00:00Z") });
    const otherSource = candidate({ sourceId: 2, publishedAt: new Date("2026-06-01T00:00:00Z") });

    expect(selectReferenceObservations([old, recentA, recentA2, otherSource], [], 2)).toEqual([recentA.id, otherSource.id]);
  });

  it("écarte les textes trop courts ou trop longs", () => {
    const short = candidate({ content: "Texte court ".repeat(10) });
    const long = candidate({ content: "mot ".repeat(12_500) });
    const good = candidate({});
    expect(selectReferenceObservations([short, long, good])).toEqual([good.id]);
  });

  it("complète un jeu existant en tenant compte de sa répartition", () => {
    const existing = Array.from({ length: 28 }, () => candidate({ category: "Actualité", organizationType: "MEDIA" }));
    const media = candidate({ category: "Actualité", organizationType: "MEDIA" });
    const sport = candidate({ category: "Sports", organizationType: "SPORTS_CLUB" });
    const police = candidate({ category: "Société", organizationType: "POLICE" });

    expect(selectReferenceObservations([media, sport, police], existing).sort()).toEqual([sport.id, police.id].sort());
    expect(selectReferenceObservations([media], [...existing, sport, police])).toEqual([]);
  });

  it("écarte les pages de service, les extraits tronqués et le HTML", () => {
    const body = "Un texte d’actualité assez long. ".repeat(20);
    expect(looksLikeArticle({ title: "Col·laboradors", content: body })).toBe(false);
    expect(looksLikeArticle({ title: "Fes Voluntariat", content: body })).toBe(false);
    expect(looksLikeArticle({ title: "Aaron Ganal inicia una nova etapa", content: `<p>${body} [&#8230;]</p>` })).toBe(false);
    expect(looksLikeArticle({ title: "Aaron Ganal inicia una nova etapa", content: `${body} The post first appeared on BC` })).toBe(false);
    expect(looksLikeArticle({ title: "Aaron Ganal inicia una nova etapa", content: body })).toBe(true);
  });

  it("ne retient pas deux fois le même communiqué, même traduit", () => {
    const catalan = candidate({
      sourceId: 1,
      title: "Grandvalira Resorts referma les bones perspectives a la 47a Fira",
      content: `La 47a Fira, promoció fins al 9 de desembre, estalvis de 400 €, descompte del 5% i obertura el 4 de desembre. ${"text ".repeat(200)}`,
    });
    const french = candidate({
      sourceId: 2,
      title: "Grandvalira Resorts confirme les bonnes perspectives à la 47e Foire",
      content: `La 47e Foire, promotion jusqu’au 9 décembre, économies de 400 €, remise de 5 % et ouverture le 4 décembre. ${"texte ".repeat(200)}`,
    });
    const copy = candidate({ sourceId: 3, title: french.title, content: french.content });
    const other = candidate({ sourceId: 4 });

    expect(referenceFingerprints(catalan)).toContain("chiffres:47 9 400 5 4");
    // La version la plus récente est gardée, les deux autres sont des doublons.
    expect(selectReferenceObservations([catalan, french, copy, other]).sort()).toEqual([copy.id, other.id].sort());
    expect(selectReferenceObservations([french, copy], [catalan])).toEqual([]);
  });
});
