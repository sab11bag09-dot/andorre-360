import type {
  SourcePublicationMode,
  SourceTrustLevel,
} from "@/lib/generated/prisma/client";

export type AutoPublicationInput = {
  publicationMode: SourcePublicationMode;
  sourceTrustLevel: SourceTrustLevel;
  sourceUrl: string;
  observationUrl: string;
  title: string;
  content: string;
  hasContradictorySignals?: boolean;
};

export type AutoPublicationDecision =
  | { allowed: true; reasons: [] }
  | { allowed: false; reasons: string[] };

const MIN_CONTENT_LENGTH = 280;

export function evaluateAutoPublication(
  input: AutoPublicationInput,
): AutoPublicationDecision {
  const reasons: string[] = [];

  if (input.publicationMode !== "AUTO") {
    reasons.push("source_auto_mode_not_enabled");
  }
  if (input.sourceTrustLevel === "LOW") {
    reasons.push("source_trust_too_low");
  }
  if (input.sourceTrustLevel === "MEDIUM") {
    reasons.push("source_requires_review");
  }
  if (!isHttpsUrl(input.sourceUrl)) {
    reasons.push("source_url_not_secure");
  }
  if (!isHttpsUrl(input.observationUrl)) {
    reasons.push("observation_url_not_secure");
  }
  if (!sameOrigin(input.sourceUrl, input.observationUrl)) {
    reasons.push("observation_origin_mismatch");
  }
  if (input.title.trim().length < 12) {
    reasons.push("title_too_short");
  }
  if (input.content.trim().length < MIN_CONTENT_LENGTH) {
    reasons.push("content_too_short");
  }
  if (input.hasContradictorySignals) {
    reasons.push("contradictory_signals");
  }

  return reasons.length === 0
    ? { allowed: true, reasons: [] }
    : { allowed: false, reasons };
}

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function sameOrigin(sourceUrl: string, observationUrl: string): boolean {
  try {
    return new URL(sourceUrl).origin === new URL(observationUrl).origin;
  } catch {
    return false;
  }
}
