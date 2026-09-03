import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireAdmin, simulateAutomatedHome } = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  simulateAutomatedHome: vi.fn(),
}));

vi.mock("@/lib/admin/requireAdmin", () => ({
  requireAdmin,
}));

vi.mock("@/lib/editorial/simulateAutomatedHome", () => ({
  simulateAutomatedHome,
}));

import { runHomeEditorialSimulation } from "./home-editorial-simulation";

const generatedAt = new Date("2026-09-02T12:00:00.000Z");
const publishedAt = new Date("2026-09-02T10:00:00.000Z");

function makeFacts(articleId: number, title: string) {
  return {
    articleId,
    title,
    description: "Description",
    content: "Contenu",
    category: "ACTUALITÉ",
    image: `/images/article-${articleId}.jpg`,
    videoUrl: null,
    publishedAt,
    translations: {
      catalanPublished: true,
      spanishPublished: true,
    },
    observation: {
      id: articleId + 100,
      url: `https://source.example/${articleId}`,
      publishedAt,
      collectedAt: publishedAt,
    },
    source: {
      id: articleId + 200,
      name: `Source ${articleId}`,
      url: "https://source.example",
      trustLevel: "OFFICIAL",
      organizationType: "GOVERNMENT",
      publicationMode: "AUTO",
    },
  };
}

function makeAssessment(articleId: number, reasons: string[]) {
  return {
    articleId,
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
    reasons,
  };
}

describe("runHomeEditorialSimulation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdmin.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
    });
  });

  it("exige un administrateur avant de lancer la simulation", async () => {
    requireAdmin.mockRejectedValue(new Error("Accès refusé"));

    await expect(runHomeEditorialSimulation()).rejects.toThrow("Accès refusé");

    expect(simulateAutomatedHome).not.toHaveBeenCalled();
  });

  it("produit un rapport sérialisable et lisible", async () => {
    simulateAutomatedHome.mockResolvedValue({
      mode: "PROPOSAL_ONLY",
      generatedAt,
      candidateCount: 3,
      candidateFacts: [
        makeFacts(1, "Article placé"),
        makeFacts(2, "Article exclu"),
        makeFacts(3, "Article non retenu"),
      ],
      assessments: [
        makeAssessment(1, ["Sujet prioritaire."]),
        makeAssessment(2, ["Information périmée."]),
        makeAssessment(3, ["Candidat admissible."]),
      ],
      composition: {
        placements: [
          {
            zone: "hero",
            articleId: 1,
            sourceId: 201,
            category: "ACTUALITÉ",
            score: 90,
            origin: "AUTOMATED",
          },
        ],
        evaluations: [
          {
            articleId: 1,
            eligible: true,
            score: 90,
            exclusions: [],
            eligibleZones: ["hero", "feature", "secondary", "card", "brief"],
            policyVersion: "1.0",
          },
          {
            articleId: 2,
            eligible: false,
            score: 95,
            exclusions: ["EXPIRED_CONTENT"],
            eligibleZones: [],
            policyVersion: "1.0",
          },
          {
            articleId: 3,
            eligible: true,
            score: 70,
            exclusions: [],
            eligibleZones: ["secondary", "card", "brief"],
            policyVersion: "1.0",
          },
        ],
        unfilledSlots: {
          hero: 0,
          feature: 1,
          "grand-format": 1,
          card: 4,
          brief: 4,
        },
      },
    });

    await expect(runHomeEditorialSimulation()).resolves.toEqual({
      success: true,
      mode: "PROPOSAL_ONLY",
      generatedAt: "2026-09-02T12:00:00.000Z",
      candidateCount: 3,
      placements: [
        {
          articleId: 1,
          title: "Article placé",
          category: "ACTUALITÉ",
          sourceName: "Source 1",
          score: 90,
          reasons: ["Sujet prioritaire."],
          exclusions: [],
          zone: "hero",
          origin: "AUTOMATED",
        },
      ],
      excluded: [
        {
          articleId: 2,
          title: "Article exclu",
          category: "ACTUALITÉ",
          sourceName: "Source 2",
          score: 95,
          reasons: ["Information périmée."],
          exclusions: ["EXPIRED_CONTENT"],
        },
      ],
      unselected: [
        {
          articleId: 3,
          title: "Article non retenu",
          category: "ACTUALITÉ",
          sourceName: "Source 3",
          score: 70,
          reasons: ["Candidat admissible."],
          exclusions: [],
        },
      ],
      unfilledSlots: {
        hero: 0,
        feature: 1,
        "grand-format": 1,
        card: 4,
        brief: 4,
      },
    });

    expect(simulateAutomatedHome).toHaveBeenCalledWith({
      candidateLimit: 30,
    });
  });

  it("retourne une erreur sûre sans divulguer le fournisseur", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    simulateAutomatedHome.mockRejectedValue(
      new Error("Erreur secrète du fournisseur"),
    );

    await expect(runHomeEditorialSimulation()).resolves.toEqual({
      success: false,
      code: "SIMULATION_FAILED",
      message:
        "La simulation de l’accueil a échoué. Aucun placement n’a été modifié.",
    });

    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
