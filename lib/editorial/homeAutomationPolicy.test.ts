import { describe, expect, it } from "vitest";

import {
  calculateHomeCandidateScore,
  evaluateHomeAutomationCandidate,
  type HomeAutomationCandidate,
} from "./homeAutomationPolicy";

function makeCandidate(
  overrides: Partial<HomeAutomationCandidate> = {},
): HomeAutomationCandidate {
  return {
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
      andorraImportance: 25,
      freshness: 20,
      sourceReliability: 15,
      populationImpact: 15,
      editorialQuality: 10,
      visualInterest: 5,
      originality: 5,
      explanatoryOrPracticalValue: 5,
    },
    ...overrides,
  };
}

describe("homeAutomationPolicy", () => {
  it("calcule un score transparent sur 100", () => {
    expect(calculateHomeCandidateScore(makeCandidate().scores)).toBe(100);
  });

  it("détermine les zones accessibles selon le score", () => {
    const evaluation = evaluateHomeAutomationCandidate(
      makeCandidate({
        scores: {
          andorraImportance: 20,
          freshness: 15,
          sourceReliability: 15,
          populationImpact: 12,
          editorialQuality: 8,
          visualInterest: 4,
          originality: 3,
          explanatoryOrPracticalValue: 3,
        },
      }),
    );

    expect(evaluation.score).toBe(80);
    expect(evaluation.eligible).toBe(true);
    expect(evaluation.eligibleZones).toEqual([
      "feature",
      "secondary",
      "card",
      "brief",
    ]);
  });

  it("applique les exclusions avant le score", () => {
    const evaluation = evaluateHomeAutomationCandidate(
      makeCandidate({
        category: "ILS_EN_PARLENT",
        catalanPublished: false,
        image: " ",
      }),
    );

    expect(evaluation.score).toBe(100);
    expect(evaluation.eligible).toBe(false);
    expect(evaluation.eligibleZones).toEqual([]);
    expect(evaluation.exclusions).toEqual([
      "MISSING_CATALAN_VERSION",
      "MISSING_IMAGE",
      "FORBIDDEN_CATEGORY",
    ]);
  });

  it.each(["LOW", "MEDIUM"] as const)(
    "refuse une source au niveau de confiance %s",
    (sourceTrustLevel) => {
      const evaluation = evaluateHomeAutomationCandidate(
        makeCandidate({ sourceTrustLevel }),
      );

      expect(evaluation.eligible).toBe(false);
      expect(evaluation.exclusions).toContain("UNRELIABLE_SOURCE");
    },
  );

  it("refuse un article périmé même avec un score maximal", () => {
    const evaluation = evaluateHomeAutomationCandidate(
      makeCandidate({ expired: true }),
    );

    expect(evaluation.score).toBe(100);
    expect(evaluation.eligible).toBe(false);
    expect(evaluation.eligibleZones).toEqual([]);
  });

  it("refuse une note supérieure au maximum prévu", () => {
    const candidate = makeCandidate({
      scores: {
        ...makeCandidate().scores,
        freshness: 21,
      },
    });

    expect(() => evaluateHomeAutomationCandidate(candidate)).toThrow(
      /freshness/,
    );
  });
});
