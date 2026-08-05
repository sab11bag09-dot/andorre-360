import type { AutoPublicationDecision } from "./autoPublication";

export const AUTO_PUBLICATION_POLICY_VERSION = "2026-08-05.v1";

export type AutoPublicationAuditInput = {
  sourceId: number;
  observationId: number;
  sourceUrl: string;
  observationUrl: string;
  publicationMode: string;
  trustLevel: string;
  decision: AutoPublicationDecision;
  generator?: {
    provider: string;
    model?: string;
    promptVersion?: string;
  };
};

export type AutoPublicationAuditRecord = {
  policyVersion: string;
  sourceId: number;
  observationId: number;
  sourceUrl: string;
  observationUrl: string;
  publicationMode: string;
  trustLevel: string;
  allowed: boolean;
  reasons: string[];
  generator: {
    provider: string;
    model: string | null;
    promptVersion: string | null;
  };
};

export function buildAutoPublicationAudit(
  input: AutoPublicationAuditInput,
): AutoPublicationAuditRecord {
  return {
    policyVersion: AUTO_PUBLICATION_POLICY_VERSION,
    sourceId: input.sourceId,
    observationId: input.observationId,
    sourceUrl: input.sourceUrl,
    observationUrl: input.observationUrl,
    publicationMode: input.publicationMode,
    trustLevel: input.trustLevel,
    allowed: input.decision.allowed,
    reasons: input.decision.reasons,
    generator: {
      provider: input.generator?.provider ?? "deterministic",
      model: input.generator?.model ?? null,
      promptVersion: input.generator?.promptVersion ?? null,
    },
  };
}
