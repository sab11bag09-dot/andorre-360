import { describe, expect, it } from "vitest";

import {
  buildHomeCompositionCandidate,
  joinFactsAndAssessments,
  type HomeCandidateAssessment,
} from "./homeCandidateAssessment";
import type { HomeCandidateFacts } from "./loadHomeCandidateFacts";

function makeFacts(
  overrides: Partial<HomeCandidateFacts> = {},
): HomeCandidateFacts {
  const publishedAt = new Date("2026-09-02T10:00:00.000Z");

  return {
    articleId: 42,
    title: "Une information importante",
    description: "Description",
    content: "Contenu",
    category: "ACTUALITÉ",
    image: "/images/article.jpg",
    videoUrl: null,
    publishedAt,
    translations: {
      catalanPublished: true,
      spanishPublished: true,
    },
    observation: {
      id: 7,
      url: "https://source.example/article",
      publishedAt,
      collectedAt: publishedAt,
    },
    source: {
      id: 3,
      name: "Source fiable",
      url: "https://source.example",
      trustLevel: "HIGH",
      organizationType: "MEDIA",
      publicationMode: "AUTO",
    },
    ...overrides,
  };
}

function makeAssessment(
  overrides: Partial<HomeCandidateAssessment> = {},
): HomeCandidateAssessment {
  return {
    articleId: 42,
    andorraImportance: 20,
    freshness: 18,
    populationImpact: 12,
    editorialQuality: 9,
    visualInterest: 4,
    originality: 4,
    explanatoryOrPracticalValue: 4,
    duplicate: false,
    disguisedAdvertisement: false,
    expired: false,
    contradictorySignals: false,
    grandFormatEligible: false,
    reasons: ["Sujet récent et utile."],
    ...overrides,
  };
}

describe("homeCandidateAssessment", () => {
  it("transforme les faits et l’évaluation en candidat", () => {
    expect(
      buildHomeCompositionCandidate(makeFacts(), makeAssessment()),
    ).toEqual({
      sourceId: 3,
      publishedAt: new Date("2026-09-02T10:00:00.000Z"),
      grandFormatEligible: false,
      article: {
        articleId: 42,
        category: "ACTUALITÉ",
        image: "/images/article.jpg",
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
        scores: {
          andorraImportance: 20,
          freshness: 18,
          sourceReliability: 12,
          populationImpact: 12,
          editorialQuality: 9,
          visualInterest: 4,
          originality: 4,
          explanatoryOrPracticalValue: 4,
        },
      },
    });
  });

  it("attribue la fiabilité maximale uniquement aux sources officielles", () => {
    const candidate = buildHomeCompositionCandidate(
      makeFacts({
        source: {
          ...makeFacts().source,
          trustLevel: "OFFICIAL",
        },
      }),
      makeAssessment(),
    );

    expect(candidate.article.scores.sourceReliability).toBe(15);
  });

  it("refuse une évaluation associée au mauvais article", () => {
    expect(() =>
      buildHomeCompositionCandidate(
        makeFacts(),
        makeAssessment({ articleId: 99 }),
      ),
    ).toThrow("L’évaluation de l’article 99 ne correspond pas à l’article 42.");
  });

  it("réunit les faits et évaluations indépendamment de leur ordre", () => {
    const facts = [makeFacts({ articleId: 1 }), makeFacts({ articleId: 2 })];

    const assessments = [
      makeAssessment({ articleId: 2 }),
      makeAssessment({ articleId: 1 }),
    ];

    expect(
      joinFactsAndAssessments(facts, assessments).map(
        ({ article }) => article.articleId,
      ),
    ).toEqual([1, 2]);
  });

  it("refuse une évaluation manquante", () => {
    expect(() =>
      joinFactsAndAssessments(
        [makeFacts({ articleId: 1 }), makeFacts({ articleId: 2 })],
        [makeAssessment({ articleId: 1 })],
      ),
    ).toThrow("Aucune évaluation reçue pour l’article 2.");
  });

  it("refuse plusieurs évaluations du même article", () => {
    expect(() =>
      joinFactsAndAssessments(
        [makeFacts()],
        [
          makeAssessment(),
          makeAssessment({
            andorraImportance: 10,
          }),
        ],
      ),
    ).toThrow(
      "Le fournisseur a renvoyé plusieurs évaluations pour un même article.",
    );
  });
});
