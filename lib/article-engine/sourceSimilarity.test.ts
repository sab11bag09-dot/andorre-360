import { describe, expect, it } from "vitest";

import {
  DEFAULT_SOURCE_SIMILARITY_POLICY,
  evaluateSourceSimilarity,
  measureSourceSimilarity,
} from "./sourceSimilarity";

const SOURCE = {
  title: "Le Comú de Canillo ouvre les inscriptions au camp d’été",
  content:
    "Le Comú de Canillo a ouvert ce lundi les inscriptions au camp d’été destiné aux enfants de 4 à 12 ans. " +
    "Les familles peuvent s’inscrire en ligne jusqu’au 30 juin. Le camp proposera des activités sportives, " +
    "culturelles et de montagne pendant tout le mois de juillet, avec un encadrement assuré par des moniteurs diplômés.",
};

function article(content: string, title = "Titre", description = "Chapô") {
  return { title, description, content };
}

describe("measureSourceSimilarity", () => {
  it("mesure une ressemblance nulle pour un texte sans rapport", () => {
    const measure = measureSourceSimilarity(
      SOURCE,
      article(
        "La fédération de ski annonce un nouveau calendrier pour les compétitions régionales de la saison prochaine.",
      ),
    );

    expect(measure.sharedShingleRatio).toBe(0);
    expect(measure.longestSharedRun).toBeLessThan(5);
  });

  it("mesure une ressemblance totale pour une copie", () => {
    const measure = measureSourceSimilarity(
      SOURCE,
      article(SOURCE.content, SOURCE.title, SOURCE.content.slice(0, 120)),
    );

    expect(measure.sharedShingleRatio).toBeGreaterThan(0.95);
    expect(measure.longestSharedRun).toBeGreaterThanOrEqual(50);
  });

  it("ignore la casse, les accents, la ponctuation et les apostrophes", () => {
    const measure = measureSourceSimilarity(
      { title: "", content: "L’ÉTÉ sera chaud à Andorre, selon le service météo national." },
      article("l'ete sera chaud a andorre selon le service meteo national"),
    );

    expect(measure.longestSharedRun).toBe(11);
    expect(measure.sharedShingleRatio).toBe(1);
  });

  it("repère une phrase recopiée au milieu d’un texte original", () => {
    const measure = measureSourceSimilarity(
      SOURCE,
      article(
        "Bonne nouvelle pour les parents de la paroisse. " +
          "Le camp proposera des activités sportives, culturelles et de montagne pendant tout le mois de juillet. " +
          "Les places sont limitées.",
      ),
    );

    expect(measure.longestSharedRun).toBe(16);
  });

  it("ne compte aucun passage commun dans un texte trop court", () => {
    const measure = measureSourceSimilarity(SOURCE, article("Canillo.", "", ""));

    expect(measure.articleShingleCount).toBe(0);
    expect(measure.sharedShingleRatio).toBe(0);
  });
});

describe("evaluateSourceSimilarity", () => {
  it("accepte une réécriture qui ne partage que des noms et des dates", () => {
    const measure = measureSourceSimilarity(
      SOURCE,
      article(
        "Les enfants âgés de 4 à 12 ans pourront participer cet été au camp organisé par le Comú de Canillo. " +
          "Inscriptions sur internet, au plus tard le 30 juin 2026. Au programme en juillet : sport, culture " +
          "et sorties en montagne, sous la conduite d’animateurs qualifiés.",
      ),
    );

    expect(evaluateSourceSimilarity(measure)).toEqual({
      blocked: false,
      reasons: [],
    });
  });

  it("bloque une copie de la source", () => {
    const measure = measureSourceSimilarity(SOURCE, article(SOURCE.content));

    expect(evaluateSourceSimilarity(measure)).toEqual({
      blocked: true,
      reasons: ["shared_passages_ratio_too_high", "shared_run_too_long"],
    });
  });

  it("bloque une seule phrase longue recopiée", () => {
    const measure = measureSourceSimilarity(
      SOURCE,
      article(
        "Bonne nouvelle pour les parents de la paroisse, qui attendaient cette annonce depuis plusieurs semaines déjà. " +
          "Le camp proposera des activités sportives, culturelles et de montagne pendant tout le mois de juillet. " +
          "Les places sont limitées et les organisateurs conseillent de réserver rapidement, avant la date limite fixée.",
      ),
    );

    expect(evaluateSourceSimilarity(measure).reasons).toContain(
      "shared_run_too_long",
    );
  });

  it("utilise des seuils explicites et modifiables", () => {
    expect(DEFAULT_SOURCE_SIMILARITY_POLICY).toEqual({
      shingleSize: 5,
      maxSharedShingleRatio: 0.2,
      maxSharedRunWords: 12,
    });

    const measure = measureSourceSimilarity(SOURCE, article(SOURCE.content));

    expect(
      evaluateSourceSimilarity(measure, {
        ...DEFAULT_SOURCE_SIMILARITY_POLICY,
        maxSharedShingleRatio: 1,
        maxSharedRunWords: 1_000,
      }).blocked,
    ).toBe(false);
  });
});
