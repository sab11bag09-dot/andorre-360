import { describe, expect, it } from "vitest";

import {
  checkAgainstReference,
  isReferenceAnnotated,
  parseReferenceLines,
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

  it("accepte des formulations équivalentes séparées par « | »", () => {
    expect(textStatesFact(ARTICLE.description, "Govern | Xavier Espot")).toBe(true);
    expect(textStatesFact(ARTICLE.description, "Govern | Consell General")).toBe(false);
  });

  it("ignore les mots vides : un fait sans mot clé n’est jamais satisfait", () => {
    expect(textStatesFact(ARTICLE.content, "les des")).toBe(false);
  });

  it("contrôle un article contre l’annotation", () => {
    const check = checkAgainstReference(ARTICLE, {
      requiredFacts: "14 400 euros\nXavier Espot\nCroix-Rouge",
      forbiddenErrors: "14 000 euros\nConsell General",
    });
    expect(check).toEqual({ missingFacts: ["Croix-Rouge"], forbiddenFound: [], conforms: false });

    const wrong = checkAgainstReference(ARTICLE, { requiredFacts: "Xavier Espot", forbiddenErrors: "2,5 millions" });
    expect(wrong.forbiddenFound).toEqual(["2,5 millions"]);
    expect(wrong.conforms).toBe(false);

    expect(checkAgainstReference(ARTICLE, { requiredFacts: "Xavier Espot", forbiddenErrors: "" }).conforms).toBe(true);
  });

  it("une observation est annotée dès qu’elle a un fait obligatoire", () => {
    expect(isReferenceAnnotated({ requiredFacts: "  \n", forbiddenErrors: "14 000 euros" })).toBe(false);
    expect(isReferenceAnnotated({ requiredFacts: "Xavier Espot", forbiddenErrors: "" })).toBe(true);
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
    contentLength: 1200,
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
    const short = candidate({ contentLength: 120 });
    const long = candidate({ contentLength: 50_000 });
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
});
