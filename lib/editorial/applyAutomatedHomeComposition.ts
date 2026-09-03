export type HomeCompositionApplicationRuntime = {
  enabled: boolean;
  emergencyStop: boolean;
};

export type HomeCompositionApplicationBlockReason =
  "feature_disabled" | "emergency_stop";

export type HomeCompositionApplicationDecision =
  | {
      allowed: true;
      reason: null;
    }
  | {
      allowed: false;
      reason: HomeCompositionApplicationBlockReason;
    };

export function readHomeCompositionApplicationRuntime(
  env: Record<string, string | undefined> = process.env,
): HomeCompositionApplicationRuntime {
  return {
    enabled: env.AI_HOME_COMPOSITION_APPLY_ENABLED === "true",
    emergencyStop:
      env.AI_HOME_COMPOSITION_EMERGENCY_STOP === "true" ||
      env.AI_AUTO_PUBLICATION_EMERGENCY_STOP === "true",
  };
}

export function evaluateHomeCompositionApplicationRuntime(
  runtime: HomeCompositionApplicationRuntime,
): HomeCompositionApplicationDecision {
  if (runtime.emergencyStop) {
    return {
      allowed: false,
      reason: "emergency_stop",
    };
  }

  if (!runtime.enabled) {
    return {
      allowed: false,
      reason: "feature_disabled",
    };
  }

  return {
    allowed: true,
    reason: null,
  };
}
