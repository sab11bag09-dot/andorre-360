import OpenAI from "openai";

import type {
  HomeCandidateAssessment,
  HomeCandidateAssessmentProvider,
} from "./homeCandidateAssessment";
import type { HomeCandidateFacts } from "./loadHomeCandidateFacts";

const DEFAULT_MODEL = "gpt-5.6-terra";
const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_BATCH_SIZE = 10;
const MAX_CONTENT_CHARACTERS = 4_000;

type StructuredAssessmentRequest = {
  model: string;
  instructions: string;
  input: string;
  schema: Record<string, unknown>;
};

export interface StructuredHomeAssessmentClient {
  create(request: StructuredAssessmentRequest): Promise<string>;
}

export type OpenAiHomeCandidateAssessmentOptions = {
  apiKey: string;
  model?: string;
  timeoutMs?: number;
  batchSize?: number;
  now?: Date;
  client?: StructuredHomeAssessmentClient;
};

class OpenAiResponsesAssessmentClient implements StructuredHomeAssessmentClient {
  private readonly client: OpenAI;

  constructor(apiKey: string, timeoutMs: number) {
    this.client = new OpenAI({
      apiKey,
      timeout: timeoutMs,
    });
  }

  async create(request: StructuredAssessmentRequest): Promise<string> {
    const response = await this.client.responses.create({
      model: request.model,
      instructions: request.instructions,
      input: request.input,
      store: false,
      text: {
        format: {
          type: "json_schema",
          name: "home_candidate_assessment",
          strict: true,
          schema: request.schema,
        },
      },
    });

    return response.output_text;
  }
}

const assessmentSchema = {
  type: "object",
  properties: {
    assessments: {
      type: "array",
      items: {
        type: "object",
        properties: {
          articleId: {
            type: "integer",
          },
          andorraImportance: {
            type: "integer",
            minimum: 0,
            maximum: 25,
          },
          freshness: {
            type: "integer",
            minimum: 0,
            maximum: 20,
          },
          populationImpact: {
            type: "integer",
            minimum: 0,
            maximum: 15,
          },
          editorialQuality: {
            type: "integer",
            minimum: 0,
            maximum: 10,
          },
          visualInterest: {
            type: "integer",
            minimum: 0,
            maximum: 5,
          },
          originality: {
            type: "integer",
            minimum: 0,
            maximum: 5,
          },
          explanatoryOrPracticalValue: {
            type: "integer",
            minimum: 0,
            maximum: 5,
          },
          duplicate: {
            type: "boolean",
          },
          disguisedAdvertisement: {
            type: "boolean",
          },
          expired: {
            type: "boolean",
          },
          contradictorySignals: {
            type: "boolean",
          },
          grandFormatEligible: {
            type: "boolean",
          },
          reasons: {
            type: "array",
            items: {
              type: "string",
            },
            minItems: 1,
            maxItems: 5,
          },
        },
        required: [
          "articleId",
          "andorraImportance",
          "freshness",
          "populationImpact",
          "editorialQuality",
          "visualInterest",
          "originality",
          "explanatoryOrPracticalValue",
          "duplicate",
          "disguisedAdvertisement",
          "expired",
          "contradictorySignals",
          "grandFormatEligible",
          "reasons",
        ],
        additionalProperties: false,
      },
    },
  },
  required: ["assessments"],
  additionalProperties: false,
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readInteger(
  record: Record<string, unknown>,
  field: string,
  minimum: number,
  maximum: number,
): number {
  const value = record[field];

  if (
    !Number.isInteger(value) ||
    (value as number) < minimum ||
    (value as number) > maximum
  ) {
    throw new Error(`Champ numérique invalide : ${field}.`);
  }

  return value as number;
}

function readBoolean(record: Record<string, unknown>, field: string): boolean {
  const value = record[field];

  if (typeof value !== "boolean") {
    throw new Error(`Champ booléen invalide : ${field}.`);
  }

  return value;
}

function readReasons(record: Record<string, unknown>): string[] {
  const value = record.reasons;

  if (!Array.isArray(value) || value.length < 1 || value.length > 5) {
    throw new Error("Les motifs de l’évaluation sont invalides.");
  }

  const reasons = value.map((reason) =>
    typeof reason === "string" ? reason.trim() : "",
  );

  if (reasons.some((reason) => !reason)) {
    throw new Error("Les motifs de l’évaluation sont incomplets.");
  }

  return reasons;
}

function parseAssessment(value: unknown): HomeCandidateAssessment {
  if (!isRecord(value)) {
    throw new Error("Une évaluation de candidat est invalide.");
  }

  return {
    articleId: readInteger(value, "articleId", 1, Number.MAX_SAFE_INTEGER),
    andorraImportance: readInteger(value, "andorraImportance", 0, 25),
    freshness: readInteger(value, "freshness", 0, 20),
    populationImpact: readInteger(value, "populationImpact", 0, 15),
    editorialQuality: readInteger(value, "editorialQuality", 0, 10),
    visualInterest: readInteger(value, "visualInterest", 0, 5),
    originality: readInteger(value, "originality", 0, 5),
    explanatoryOrPracticalValue: readInteger(
      value,
      "explanatoryOrPracticalValue",
      0,
      5,
    ),
    duplicate: readBoolean(value, "duplicate"),
    disguisedAdvertisement: readBoolean(value, "disguisedAdvertisement"),
    expired: readBoolean(value, "expired"),
    contradictorySignals: readBoolean(value, "contradictorySignals"),
    grandFormatEligible: readBoolean(value, "grandFormatEligible"),
    reasons: readReasons(value),
  };
}

function parseAssessmentResponse(output: string): HomeCandidateAssessment[] {
  let value: unknown;

  try {
    value = JSON.parse(output);
  } catch {
    throw new Error("L’évaluateur de l’accueil a renvoyé un JSON invalide.");
  }

  if (!isRecord(value) || !Array.isArray(value.assessments)) {
    throw new Error(
      "L’évaluateur de l’accueil a renvoyé une réponse invalide.",
    );
  }

  return value.assessments.map(parseAssessment);
}

function chunkCandidates(
  candidates: HomeCandidateFacts[],
  batchSize: number,
): HomeCandidateFacts[][] {
  const batches: HomeCandidateFacts[][] = [];

  for (let index = 0; index < candidates.length; index += batchSize) {
    batches.push(candidates.slice(index, index + batchSize));
  }

  return batches;
}

function serializeCandidate(candidate: HomeCandidateFacts) {
  return {
    articleId: candidate.articleId,
    title: candidate.title,
    description: candidate.description,
    content: candidate.content.slice(0, MAX_CONTENT_CHARACTERS),
    category: candidate.category,
    image: candidate.image,
    videoUrl: candidate.videoUrl,
    publishedAt: candidate.publishedAt.toISOString(),
    observationPublishedAt:
      candidate.observation.publishedAt?.toISOString() ?? null,
    source: {
      id: candidate.source.id,
      name: candidate.source.name,
      organizationType: candidate.source.organizationType,
      trustLevel: candidate.source.trustLevel,
    },
  };
}

export class OpenAiHomeCandidateAssessmentProvider implements HomeCandidateAssessmentProvider {
  private readonly model: string;
  private readonly batchSize: number;
  private readonly now: Date;
  private readonly client: StructuredHomeAssessmentClient;

  constructor(options: OpenAiHomeCandidateAssessmentOptions) {
    if (!options.apiKey.trim()) {
      throw new Error("La variable OPENAI_API_KEY est absente.");
    }

    if (
      options.batchSize !== undefined &&
      (!Number.isInteger(options.batchSize) || options.batchSize <= 0)
    ) {
      throw new Error("La taille des lots doit être un entier positif.");
    }

    this.model = options.model?.trim() || DEFAULT_MODEL;
    this.batchSize = options.batchSize ?? DEFAULT_BATCH_SIZE;
    this.now = options.now ?? new Date();
    this.client =
      options.client ??
      new OpenAiResponsesAssessmentClient(
        options.apiKey,
        options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
      );
  }

  async assess(
    candidates: HomeCandidateFacts[],
  ): Promise<HomeCandidateAssessment[]> {
    if (candidates.length === 0) {
      return [];
    }

    const catalog = candidates.map((candidate) => ({
      articleId: candidate.articleId,
      title: candidate.title,
      category: candidate.category,
      sourceId: candidate.source.id,
      publishedAt: candidate.publishedAt.toISOString(),
    }));

    const assessments: HomeCandidateAssessment[] = [];

    for (const batch of chunkCandidates(candidates, this.batchSize)) {
      let output: string;

      try {
        output = await this.client.create({
          model: this.model,
          instructions: [
            "Évalue les candidats pour la composition automatique de la page d’accueil d’ANDORRE 360.",
            "Respecte strictement les maximums indiqués par le schéma.",
            "Évalue l’importance concrète pour l’Andorre, la fraîcheur réelle du sujet, l’impact sur la population, la qualité éditoriale, l’intérêt visuel, l’originalité et le potentiel explicatif ou pratique.",
            "Ne modifie jamais les faits fournis.",
            "Un contenu durable ou un grand format ne doit pas être pénalisé uniquement pour son ancienneté.",
            "Marque expired seulement si l’information est réellement dépassée ou trompeuse à la date d’évaluation.",
            "Marque disguisedAdvertisement lorsque le contenu est essentiellement promotionnel sans intérêt éditorial suffisant.",
            "Marque contradictorySignals si les informations fournies présentent une contradiction factuelle identifiable.",
            "Pour les doublons, compare avec le catalogue complet et marque duplicate uniquement sur la version à écarter, en conservant la version la plus fiable, complète et récente.",
            "grandFormatEligible exige un contenu approfondi et durable ; la récence seule ne suffit pas.",
            "Fournis entre un et cinq motifs courts, factuels et vérifiables.",
          ].join(" "),
          input: JSON.stringify({
            evaluatedAt: this.now.toISOString(),
            candidateCatalog: catalog,
            candidates: batch.map(serializeCandidate),
          }),
          schema: assessmentSchema,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "erreur inconnue";

        throw new Error(
          `L’évaluation OpenAI de l’accueil a échoué : ${message}`,
        );
      }

      const batchAssessments = parseAssessmentResponse(output);
      const expectedIds = new Set(batch.map(({ articleId }) => articleId));
      const receivedIds = new Set(
        batchAssessments.map(({ articleId }) => articleId),
      );

      if (
        receivedIds.size !== batchAssessments.length ||
        receivedIds.size !== expectedIds.size ||
        [...expectedIds].some((articleId) => !receivedIds.has(articleId))
      ) {
        throw new Error(
          "L’évaluateur de l’accueil n’a pas renvoyé exactement les candidats demandés.",
        );
      }

      assessments.push(...batchAssessments);
    }

    return assessments;
  }
}
