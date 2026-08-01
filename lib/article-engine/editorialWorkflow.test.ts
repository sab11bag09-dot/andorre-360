import { describe, expect, it } from "vitest";

import {
  canPublishEditorialStatus,
  canTransitionEditorialStatus,
} from "./editorialWorkflow";

describe("editorialWorkflow", () => {
  it("autorise un brouillon IA à partir en relecture", () => {
    expect(
      canTransitionEditorialStatus(
        "AI_DRAFT",
        "REVIEW",
      ),
    ).toBe(true);
  });

  it("interdit la publication directe d’un brouillon IA", () => {
    expect(
      canTransitionEditorialStatus(
        "AI_DRAFT",
        "PUBLISHED",
      ),
    ).toBe(false);

    expect(
      canPublishEditorialStatus(
        "AI_DRAFT",
      ),
    ).toBe(false);
  });

  it("autorise la validation après relecture", () => {
    expect(
      canTransitionEditorialStatus(
        "REVIEW",
        "APPROVED",
      ),
    ).toBe(true);
  });

  it("autorise une traduction approuvée à revenir en relecture", () => {
    expect(
      canTransitionEditorialStatus(
        "APPROVED",
        "REVIEW",
      ),
    ).toBe(true);
  });

  it("autorise uniquement les contenus approuvés ou déjà publiés", () => {
    expect(
      canPublishEditorialStatus("APPROVED"),
    ).toBe(true);

    expect(
      canPublishEditorialStatus("PUBLISHED"),
    ).toBe(true);

    expect(
      canPublishEditorialStatus("DRAFT"),
    ).toBe(false);

    expect(
      canPublishEditorialStatus("REVIEW"),
    ).toBe(false);
  });
});
