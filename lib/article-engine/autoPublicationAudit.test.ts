import { describe, expect, it } from "vitest";

import {
  AUTO_PUBLICATION_POLICY_VERSION,
  buildAutoPublicationAudit,
} from "./autoPublicationAudit";

describe("buildAutoPublicationAudit", () => {
  it("conserve la décision et les paramètres de reproductibilité", () => {
    expect(
      buildAutoPublicationAudit({
        sourceId: 7,
        observationId: 42,
        sourceUrl: "https://source.example",
        observationUrl: "https://source.example/item",
        publicationMode: "AUTO",
        trustLevel: "OFFICIAL",
        decision: {
          allowed: false,
          reasons: ["content_too_short"],
        },
        generator: {
          provider: "openai",
          model: "gpt-5",
          promptVersion: "editorial-auto-v1",
        },
      }),
    ).toEqual({
      policyVersion: AUTO_PUBLICATION_POLICY_VERSION,
      sourceId: 7,
      observationId: 42,
      sourceUrl: "https://source.example",
      observationUrl: "https://source.example/item",
      publicationMode: "AUTO",
      trustLevel: "OFFICIAL",
      allowed: false,
      reasons: ["content_too_short"],
      generator: {
        provider: "openai",
        model: "gpt-5",
        promptVersion: "editorial-auto-v1",
      },
    });
  });

  it("utilise des valeurs explicites lorsque le générateur est déterministe", () => {
    const audit = buildAutoPublicationAudit({
      sourceId: 1,
      observationId: 2,
      sourceUrl: "https://source.example",
      observationUrl: "https://source.example/item",
      publicationMode: "MANUAL",
      trustLevel: "HIGH",
      decision: {
        allowed: false,
        reasons: ["source_auto_mode_not_enabled"],
      },
    });

    expect(audit.generator).toEqual({
      provider: "deterministic",
      model: null,
      promptVersion: null,
    });
  });
});
