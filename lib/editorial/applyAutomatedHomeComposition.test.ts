import { describe, expect, it } from "vitest";

import {
  evaluateHomeCompositionApplicationRuntime,
  readHomeCompositionApplicationRuntime,
} from "./applyAutomatedHomeComposition";

describe("application d’une composition automatique de l’accueil", () => {
  it("est désactivée par défaut", () => {
    const runtime = readHomeCompositionApplicationRuntime({});

    expect(runtime).toEqual({
      enabled: false,
      emergencyStop: false,
    });

    expect(evaluateHomeCompositionApplicationRuntime(runtime)).toEqual({
      allowed: false,
      reason: "feature_disabled",
    });
  });

  it("donne la priorité à l’arrêt d’urgence de la composition", () => {
    const runtime = readHomeCompositionApplicationRuntime({
      AI_HOME_COMPOSITION_APPLY_ENABLED: "true",
      AI_HOME_COMPOSITION_EMERGENCY_STOP: "true",
    });

    expect(evaluateHomeCompositionApplicationRuntime(runtime)).toEqual({
      allowed: false,
      reason: "emergency_stop",
    });
  });

  it("respecte aussi l’arrêt d’urgence global de l’auto-publication", () => {
    const runtime = readHomeCompositionApplicationRuntime({
      AI_HOME_COMPOSITION_APPLY_ENABLED: "true",
      AI_AUTO_PUBLICATION_EMERGENCY_STOP: "true",
    });

    expect(evaluateHomeCompositionApplicationRuntime(runtime)).toEqual({
      allowed: false,
      reason: "emergency_stop",
    });
  });

  it("autorise l’application seulement après activation explicite", () => {
    const runtime = readHomeCompositionApplicationRuntime({
      AI_HOME_COMPOSITION_APPLY_ENABLED: "true",
    });

    expect(evaluateHomeCompositionApplicationRuntime(runtime)).toEqual({
      allowed: true,
      reason: null,
    });
  });
});
