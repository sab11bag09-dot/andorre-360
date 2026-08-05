import { describe, expect, it } from "vitest";

import { prepareAutoPublication } from "./autoPublicationOrchestration";

const enabledRuntime = {
  enabled: true,
  emergencyStop: false,
  sourceIds: [5],
};

describe("prepareAutoPublication", () => {
  it("prépare un audit sans transformer la décision en publication", () => {
    const result = prepareAutoPublication({
      sourceId: 5,
      observationId: 9,
      sourceUrl: "https://source.example",
      observationUrl: "https://source.example/item",
      publicationMode: "AUTO",
      trustLevel: "OFFICIAL",
      title: "Une actualité suffisamment descriptive",
      content: "x".repeat(300),
      runtimeConfig: enabledRuntime,
    });

    expect(result.decision.allowed).toBe(true);
    expect(result.requiresHumanReview).toBe(false);
    expect(result.audit.allowed).toBe(true);
    expect(result.audit.observationId).toBe(9);
  });

  it("force la revue humaine si une garde de contenu échoue", () => {
    const result = prepareAutoPublication({
      sourceId: 5,
      observationId: 9,
      sourceUrl: "https://source.example",
      observationUrl: "https://other.example/item",
      publicationMode: "AUTO",
      trustLevel: "OFFICIAL",
      title: "Une actualité suffisamment descriptive",
      content: "x".repeat(300),
      runtimeConfig: enabledRuntime,
    });

    expect(result.decision.allowed).toBe(false);
    expect(result.requiresHumanReview).toBe(true);
    expect(result.audit.reasons).toContain("observation_origin_mismatch");
  });

  it("force la revue humaine lorsque le runtime est désactivé", () => {
    const result = prepareAutoPublication({
      sourceId: 5,
      observationId: 9,
      sourceUrl: "https://source.example",
      observationUrl: "https://source.example/item",
      publicationMode: "AUTO",
      trustLevel: "OFFICIAL",
      title: "Une actualité suffisamment descriptive",
      content: "x".repeat(300),
      runtimeConfig: {
        enabled: false,
        emergencyStop: false,
        sourceIds: [5],
      },
    });

    expect(result.decision).toEqual({
      allowed: false,
      reasons: ["feature_disabled"],
    });
    expect(result.requiresHumanReview).toBe(true);
  });
});
