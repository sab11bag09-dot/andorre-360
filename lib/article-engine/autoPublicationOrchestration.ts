import {
  buildAutoPublicationAudit,
  type AutoPublicationAuditRecord,
} from "./autoPublicationAudit";
import {
  evaluateAutoPublication,
  type AutoPublicationDecision,
} from "./autoPublication";

export type AutoPublicationPreparationInput = {
  sourceId: number;
  observationId: number;
  sourceUrl: string;
  observationUrl: string;
  publicationMode: "AUTO" | "ASSISTED" | "MANUAL";
  trustLevel: "LOW" | "MEDIUM" | "HIGH" | "OFFICIAL";
  title: string;
  content: string;
  hasContradictorySignals?: boolean;
  generator?: {
    provider: string;
    model?: string;
    promptVersion?: string;
  };
};

export type AutoPublicationPreparation = {
  decision: AutoPublicationDecision;
  audit: AutoPublicationAuditRecord;
  requiresHumanReview: boolean;
};

export function prepareAutoPublication(
  input: AutoPublicationPreparationInput,
): AutoPublicationPreparation {
  const decision = evaluateAutoPublication({
    publicationMode: input.publicationMode,
    sourceTrustLevel: input.trustLevel,
    sourceUrl: input.sourceUrl,
    observationUrl: input.observationUrl,
    title: input.title,
    content: input.content,
    hasContradictorySignals: input.hasContradictorySignals,
  });

  return {
    decision,
    audit: buildAutoPublicationAudit({
      sourceId: input.sourceId,
      observationId: input.observationId,
      sourceUrl: input.sourceUrl,
      observationUrl: input.observationUrl,
      publicationMode: input.publicationMode,
      trustLevel: input.trustLevel,
      decision,
      generator: input.generator,
    }),
    requiresHumanReview: !decision.allowed,
  };
}
