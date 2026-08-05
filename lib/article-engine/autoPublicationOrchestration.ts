import {
  buildAutoPublicationAudit,
  type AutoPublicationAuditRecord,
} from "./autoPublicationAudit";
import {
  evaluateAutoPublication,
  type AutoPublicationDecision,
} from "./autoPublication";
import {
  evaluateAutoPublicationRuntime,
  readAutoPublicationRuntimeConfig,
  type AutoPublicationRuntimeConfig,
} from "./autoPublicationRuntime";

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
  runtimeConfig?: AutoPublicationRuntimeConfig;
};

export type AutoPublicationPreparation = {
  decision: AutoPublicationDecision;
  audit: AutoPublicationAuditRecord;
  requiresHumanReview: boolean;
};

export function prepareAutoPublication(
  input: AutoPublicationPreparationInput,
): AutoPublicationPreparation {
  const runtimeDecision = evaluateAutoPublicationRuntime(
    input.runtimeConfig ?? readAutoPublicationRuntimeConfig(),
    input.sourceId,
  );

  const contentDecision = evaluateAutoPublication({
    publicationMode: input.publicationMode,
    sourceTrustLevel: input.trustLevel,
    sourceUrl: input.sourceUrl,
    observationUrl: input.observationUrl,
    title: input.title,
    content: input.content,
    hasContradictorySignals: input.hasContradictorySignals,
  });

  const decision: AutoPublicationDecision =
    runtimeDecision.allowed && contentDecision.allowed
      ? { allowed: true, reasons: [] }
      : {
          allowed: false,
          reasons: [
            ...(!runtimeDecision.allowed ? [runtimeDecision.reason] : []),
            ...(!contentDecision.allowed ? contentDecision.reasons : []),
          ],
        };

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
