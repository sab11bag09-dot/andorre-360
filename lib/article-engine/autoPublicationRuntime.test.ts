import { describe, expect, it } from "vitest";

import {
  evaluateAutoPublicationRuntime,
  readAutoPublicationRuntimeConfig,
} from "./autoPublicationRuntime";

describe("autoPublicationRuntime", () => {
  it("désactive AUTO par défaut", () => {
    expect(readAutoPublicationRuntimeConfig({})).toEqual({
      enabled: false,
      emergencyStop: false,
      sourceIds: [],
    });

    expect(evaluateAutoPublicationRuntime({
      enabled: false,
      emergencyStop: false,
      sourceIds: [],
    }, 1)).toEqual({
      allowed: false,
      reason: "feature_disabled",
    });
  });

  it("l'arrêt d'urgence est prioritaire", () => {
    expect(evaluateAutoPublicationRuntime({
      enabled: true,
      emergencyStop: true,
      sourceIds: [1],
    }, 1)).toEqual({
      allowed: false,
      reason: "emergency_stop",
    });
  });

  it("bloque les sources absentes de la liste blanche", () => {
    expect(evaluateAutoPublicationRuntime({
      enabled: true,
      emergencyStop: false,
      sourceIds: [2],
    }, 1)).toEqual({
      allowed: false,
      reason: "source_not_allowlisted",
    });
  });

  it("autorise une source explicitement listée", () => {
    expect(evaluateAutoPublicationRuntime({
      enabled: true,
      emergencyStop: false,
      sourceIds: [1],
    }, 1)).toEqual({
      allowed: true,
      reason: null,
    });
  });
});
