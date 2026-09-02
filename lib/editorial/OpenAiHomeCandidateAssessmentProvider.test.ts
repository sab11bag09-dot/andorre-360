import { describe, expect, it, vi } from "vitest";

import {
  OpenAiHomeCandidateAssessmentProvider,
  type StructuredHomeAssessmentClient,
} from "./OpenAiHomeCandidateAssessmentProvider";
import type { HomeCandidateFacts } from "./loadHomeCandidateFacts";

function makeFacts(articleId: number): HomeCandidateFacts {
  const publishedAt = new Date("2026-09-02T10:00:00.000Z");

  return {
    articleId,
    title: `Article ${articleId}`,
    description: "Description",
    content: "Contenu complet",
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
      url: `https://source.example/article-${articleId}`,
      publishedAt,
      collectedAt: publishedAt,
    },
    source: {
      id: articleId + 200,
      name: "Source officielle",
      url: "https://source.example",
      trustLevel: "OFFICIAL",
      organizationType: "GOVERNMENT",
      publicationMode: "AUTO",
    },
  };
}

function makeAssessment(articleId: number) {
  return {
    articleId,
    andorraImportance: 22,
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
    reasons: ["Sujet important pour l’Andorre."],
  };
}

function makeClient(
  create: StructuredHomeAssessmentClient["create"],
): StructuredHomeAssessmentClient {
  return { create };
}

describe("OpenAiHomeCandidateAssessmentProvider", () => {
  it("refuse une clé API vide", () => {
    expect(
      () =>
        new OpenAiHomeCandidateAssessmentProvider({
          apiKey: " ",
          client: makeClient(vi.fn()),
        }),
    ).toThrow("La variable OPENAI_API_KEY est absente.");
  });

  it("refuse une taille de lot invalide", () => {
    expect(
      () =>
        new OpenAiHomeCandidateAssessmentProvider({
          apiKey: "test-key",
          batchSize: 0,
          client: makeClient(vi.fn()),
        }),
    ).toThrow("La taille des lots doit être un entier positif.");
  });

  it("ne contacte pas OpenAI lorsque la liste est vide", async () => {
    const create = vi.fn();
    const provider = new OpenAiHomeCandidateAssessmentProvider({
      apiKey: "test-key",
      client: makeClient(create),
    });

    await expect(provider.assess([])).resolves.toEqual([]);
    expect(create).not.toHaveBeenCalled();
  });

  it("évalue les candidats par lots avec un schéma strict", async () => {
    const create = vi.fn(
      async (request: { input: string; schema: Record<string, unknown> }) => {
        const input = JSON.parse(request.input) as {
          candidates: Array<{ articleId: number }>;
        };

        return JSON.stringify({
          assessments: input.candidates.map(({ articleId }) =>
            makeAssessment(articleId),
          ),
        });
      },
    );

    const provider = new OpenAiHomeCandidateAssessmentProvider({
      apiKey: "test-key",
      model: "test-model",
      batchSize: 2,
      now: new Date("2026-09-02T12:00:00.000Z"),
      client: makeClient(create),
    });

    const result = await provider.assess([
      makeFacts(1),
      makeFacts(2),
      makeFacts(3),
    ]);

    expect(result.map(({ articleId }) => articleId)).toEqual([1, 2, 3]);
    expect(create).toHaveBeenCalledTimes(2);
    expect(create).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        model: "test-model",
        schema: expect.objectContaining({
          type: "object",
          additionalProperties: false,
        }),
      }),
    );

    const firstRequest = create.mock.calls[0][0];
    const firstInput = JSON.parse(firstRequest.input) as {
      evaluatedAt: string;
      candidateCatalog: unknown[];
      candidates: unknown[];
    };

    expect(firstInput.evaluatedAt).toBe("2026-09-02T12:00:00.000Z");
    expect(firstInput.candidateCatalog).toHaveLength(3);
    expect(firstInput.candidates).toHaveLength(2);
  });

  it("refuse un JSON invalide", async () => {
    const provider = new OpenAiHomeCandidateAssessmentProvider({
      apiKey: "test-key",
      client: makeClient(vi.fn(async () => "réponse invalide")),
    });

    await expect(provider.assess([makeFacts(1)])).rejects.toThrow(
      "L’évaluateur de l’accueil a renvoyé un JSON invalide.",
    );
  });

  it("refuse une note hors limites", async () => {
    const provider = new OpenAiHomeCandidateAssessmentProvider({
      apiKey: "test-key",
      client: makeClient(
        vi.fn(async () =>
          JSON.stringify({
            assessments: [
              {
                ...makeAssessment(1),
                freshness: 21,
              },
            ],
          }),
        ),
      ),
    });

    await expect(provider.assess([makeFacts(1)])).rejects.toThrow(
      "Champ numérique invalide : freshness.",
    );
  });

  it("refuse une réponse incomplète", async () => {
    const provider = new OpenAiHomeCandidateAssessmentProvider({
      apiKey: "test-key",
      client: makeClient(
        vi.fn(async () =>
          JSON.stringify({
            assessments: [makeAssessment(1)],
          }),
        ),
      ),
    });

    await expect(provider.assess([makeFacts(1), makeFacts(2)])).rejects.toThrow(
      "L’évaluateur de l’accueil n’a pas renvoyé exactement les candidats demandés.",
    );
  });

  it("refuse les identifiants dupliqués dans la réponse", async () => {
    const provider = new OpenAiHomeCandidateAssessmentProvider({
      apiKey: "test-key",
      client: makeClient(
        vi.fn(async () =>
          JSON.stringify({
            assessments: [makeAssessment(1), makeAssessment(1)],
          }),
        ),
      ),
    });

    await expect(provider.assess([makeFacts(1), makeFacts(2)])).rejects.toThrow(
      "L’évaluateur de l’accueil n’a pas renvoyé exactement les candidats demandés.",
    );
  });

  it("encapsule une erreur du fournisseur", async () => {
    const provider = new OpenAiHomeCandidateAssessmentProvider({
      apiKey: "test-key",
      client: makeClient(
        vi.fn(async () => {
          throw new Error("Délai dépassé");
        }),
      ),
    });

    await expect(provider.assess([makeFacts(1)])).rejects.toThrow(
      "L’évaluation OpenAI de l’accueil a échoué : Délai dépassé",
    );
  });
});
