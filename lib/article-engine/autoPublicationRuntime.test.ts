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
    });
    expect(evaluateAutoPublicationRuntime({
      enabled: false,
      emergencyStop: false,
    })).toEqual({
      allowed: false,
      reason: "feature_disabled",
    });
  });

  it("l'arrêt d'urgence est prioritaire", () => {
    expect(evaluateAutoPublicationRuntime({
      enabled: true,
      emergencyStop: true,
    })).toEqual({
      allowed: false,
      reason: "emergency_stop",
    });
  });

  it("autorise uniquement une configuration explicitement activée", () => {
    expect(evaluateAutoPublicationRuntime({
      enabled: true,
      emergencyStop: false,
    })).toEqual({
      allowed: true,
      reason: null,
    });
  });
});
