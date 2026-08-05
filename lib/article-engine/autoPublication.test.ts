import { describe, expect, it } from "vitest";

import { evaluateAutoPublication } from "./autoPublication";

const validInput = {
  publicationMode: "AUTO" as const,
  sourceTrustLevel: "OFFICIAL" as const,
  sourceUrl: "https://source.example",
  observationUrl: "https://source.example/news/item",
  title: "Une actualité suffisamment descriptive",
  content: "x".repeat(300),
};

describe("evaluateAutoPublication", () => {
  it("autorise une source AUTO officielle avec une provenance cohérente", () => {
    expect(evaluateAutoPublication(validInput)).toEqual({
      allowed: true,
      reasons: [],
    });
  });

  it("bloque une source qui n'est pas explicitement en mode AUTO", () => {
    const decision = evaluateAutoPublication({
      ...validInput,
      publicationMode: "MANUAL",
    });

    expect(decision).toEqual({
      allowed: false,
      reasons: ["source_auto_mode_not_enabled"],
    });
  });

  it("bloque une source non officielle ou une provenance incohérente", () => {
    const decision = evaluateAutoPublication({
      ...validInput,
      sourceTrustLevel: "MEDIUM",
      observationUrl: "https://other.example/news/item",
    });

    expect(decision.allowed).toBe(false);

    if (!decision.allowed) {
      expect(decision.reasons).toEqual([
        "source_requires_review",
        "observation_origin_mismatch",
      ]);
    }
  });

  it("bloque les contenus insuffisants et les signaux contradictoires", () => {
    const decision = evaluateAutoPublication({
      ...validInput,
      title: "Court",
      content: "Trop court",
      hasContradictorySignals: true,
    });

    expect(decision.allowed).toBe(false);

    if (!decision.allowed) {
      expect(decision.reasons).toEqual([
        "title_too_short",
        "content_too_short",
        "contradictory_signals",
      ]);
    }
  });
});
