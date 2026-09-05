import { describe, expect, it, vi } from "vitest";

import type {
  HomeCandidateAssessment,
  HomeCandidateAssessmentProvider,
} from "./homeCandidateAssessment";
import type { HomeCandidateFacts } from "./loadHomeCandidateFacts";
import type { LockedHomePublication } from "./loadLockedHomePlacements";
import { simulateAutomatedHome } from "./simulateAutomatedHome";

function makeFacts(articleId: number): HomeCandidateFacts {
  const publishedAt = new Date("2026-09-02T10:00:00.000Z");

  return {
    articleId,
    title: `Article ${articleId}`,
    description: "Description",
    content: "Contenu complet",
    category: articleId % 2 === 0 ? "SOCIÉTÉ" : "ACTUALITÉ",
    image: `/images/article-${articleId}.jpg`,
    videoUrl: null,
    publishedAt,
    translations: {
      catalanPublished: true,
      spanishPublished: true,
    },
    observation: {
      id: articleId + 100,
      url: `https://source.example/article-${articleId}`,
      publishedAt,
      collectedAt: publishedAt,
    },
    source: {
      id: articleId + 200,
      name: `Source ${articleId}`,
      url: `https://source-${articleId}.example`,
      trustLevel: "OFFICIAL",
      organizationType: "GOVERNMENT",
      publicationMode: "AUTO",
    },
  };
}

function makeAssessment(articleId: number): HomeCandidateAssessment {
  return {
    articleId,
    andorraImportance: 25,
    freshness: 20,
    populationImpact: 15,
    editorialQuality: 10,
    visualInterest: 5,
    originality: 5,
    explanatoryOrPracticalValue: 5,
    duplicate: false,
    disguisedAdvertisement: false,
    expired: false,
    contradictorySignals: false,
    grandFormatEligible: false,
    reasons: ["Candidat prioritaire."],
  };
}

function makeProvider(
  assess: HomeCandidateAssessmentProvider["assess"],
): HomeCandidateAssessmentProvider {
  return {
    assess,
  };
}

function makeLockedLoader(placements: LockedHomePublication[] = []) {
  return vi.fn(async () => placements);
}

describe("simulateAutomatedHome", () => {
  it("relie le chargement, l’évaluation et la composition", async () => {
    const facts = [makeFacts(1), makeFacts(2), makeFacts(3)];
    const loadCandidateFacts = vi.fn(async () => facts);
    const loadLockedPlacements = makeLockedLoader();

    const assess = vi.fn(async (receivedFacts: HomeCandidateFacts[]) =>
      receivedFacts.map(({ articleId }) => makeAssessment(articleId)),
    );

    const generatedAt = new Date("2026-09-02T12:00:00.000Z");

    const result = await simulateAutomatedHome(
      {
        candidateLimit: 30,
        generatedAt,
      },
      {
        loadCandidateFacts,
        loadLockedPlacements,
        assessmentProvider: makeProvider(assess),
      },
    );

    expect(loadCandidateFacts).toHaveBeenCalledWith(30);
    expect(loadLockedPlacements).toHaveBeenCalledWith(generatedAt);
    expect(assess).toHaveBeenCalledWith(facts);
    expect(result.mode).toBe("PROPOSAL_ONLY");
    expect(result.generatedAt).toEqual(generatedAt);
    expect(result.candidateCount).toBe(3);
    expect(result.lockedPlacements).toEqual([]);
    expect(result.assessments).toHaveLength(3);

    expect(result.composition.placements[0]).toEqual(
      expect.objectContaining({
        zone: "hero",
        articleId: 3,
        origin: "AUTOMATED",
      }),
    );
  });

  it("ne contacte pas l’évaluateur sans candidat", async () => {
    const assess = vi.fn();

    const result = await simulateAutomatedHome(
      {
        generatedAt: new Date("2026-09-02T12:00:00.000Z"),
      },
      {
        loadCandidateFacts: vi.fn(async () => []),
        loadLockedPlacements: makeLockedLoader(),
        assessmentProvider: makeProvider(assess),
      },
    );

    expect(assess).not.toHaveBeenCalled();
    expect(result.candidateCount).toBe(0);
    expect(result.lockedPlacements).toEqual([]);
    expect(result.assessments).toEqual([]);
    expect(result.composition.placements).toEqual([]);

    expect(result.composition.unfilledSlots).toEqual({
      hero: 1,
      feature: 1,
      "grand-format": 1,
      card: 5,
      brief: 3,
    });
  });

  it("préserve un placement humain absent des candidats OpenAI", async () => {
    const assess = vi.fn();

    const lockedPlacement: LockedHomePublication = {
      publicationId: 10,
      priority: 20,
      startsAt: null,
      endsAt: null,
      updatedAt: new Date("2026-09-03T08:00:00.000Z"),
      zone: "hero",
      articleId: 42,
      title: "Sélection humaine",
      category: "POLITIQUE",
      sourceId: null,
      sourceName: "Rédaction",
    };

    const result = await simulateAutomatedHome(
      {
        generatedAt: new Date("2026-09-03T10:00:00.000Z"),
      },
      {
        loadCandidateFacts: vi.fn(async () => []),
        loadLockedPlacements: makeLockedLoader([lockedPlacement]),
        assessmentProvider: makeProvider(assess),
      },
    );

    expect(assess).not.toHaveBeenCalled();
    expect(result.lockedPlacements).toEqual([lockedPlacement]);

    expect(result.composition.placements).toEqual([
      {
        zone: "hero",
        articleId: 42,
        sourceId: null,
        category: "POLITIQUE",
        score: 0,
        origin: "LOCKED",
      },
    ]);

    expect(result.composition.unfilledSlots.hero).toBe(0);
  });

  it("conserve les motifs produits par l’évaluateur", async () => {
    const facts = [makeFacts(1)];

    const assessment = {
      ...makeAssessment(1),
      reasons: ["Impact national.", "Information récente."],
    };

    const result = await simulateAutomatedHome(
      {},
      {
        loadCandidateFacts: vi.fn(async () => facts),
        loadLockedPlacements: makeLockedLoader(),
        assessmentProvider: makeProvider(vi.fn(async () => [assessment])),
      },
    );

    expect(result.assessments[0].reasons).toEqual([
      "Impact national.",
      "Information récente.",
    ]);
  });

  it("refuse une réponse qui ne couvre pas tous les candidats", async () => {
    await expect(
      simulateAutomatedHome(
        {},
        {
          loadCandidateFacts: vi.fn(async () => [makeFacts(1), makeFacts(2)]),
          loadLockedPlacements: makeLockedLoader(),
          assessmentProvider: makeProvider(
            vi.fn(async () => [makeAssessment(1)]),
          ),
        },
      ),
    ).rejects.toThrow("Aucune évaluation reçue pour l’article 2.");
  });

  it("transmet la date de simulation au contrôle de fraîcheur", async () => {
    const staleFacts = makeFacts(1);

    staleFacts.publishedAt = new Date("2026-08-20T10:00:00.000Z");

    const result = await simulateAutomatedHome(
      {
        generatedAt: new Date("2026-09-03T10:00:00.000Z"),
      },
      {
        loadCandidateFacts: vi.fn(async () => [staleFacts]),
        loadLockedPlacements: makeLockedLoader(),
        assessmentProvider: makeProvider(
          vi.fn(async () => [makeAssessment(1)]),
        ),
      },
    );

    expect(result.composition.placements).toEqual([]);
  });

  it("propage une panne de l’évaluateur sans produire de composition", async () => {
    const error = new Error("Évaluateur indisponible.");

    await expect(
      simulateAutomatedHome(
        {},
        {
          loadCandidateFacts: vi.fn(async () => [makeFacts(1)]),
          loadLockedPlacements: makeLockedLoader(),
          assessmentProvider: makeProvider(
            vi.fn(async () => {
              throw error;
            }),
          ),
        },
      ),
    ).rejects.toBe(error);
  });
});
