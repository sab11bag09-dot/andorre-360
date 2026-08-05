export type AutoPublicationRuntimeConfig = {
  enabled: boolean;
  emergencyStop: boolean;
};

export type AutoPublicationRuntimeDecision =
  | { allowed: true; reason: null }
  | { allowed: false; reason: "feature_disabled" | "emergency_stop" };

export function readAutoPublicationRuntimeConfig(
  env: Record<string, string | undefined> = process.env,
): AutoPublicationRuntimeConfig {
  return {
    enabled: env.AI_AUTO_PUBLICATION_ENABLED === "true",
    emergencyStop: env.AI_AUTO_PUBLICATION_EMERGENCY_STOP === "true",
  };
}

export function evaluateAutoPublicationRuntime(
  config: AutoPublicationRuntimeConfig,
): AutoPublicationRuntimeDecision {
  if (config.emergencyStop) {
    return { allowed: false, reason: "emergency_stop" };
  }

  if (!config.enabled) {
    return { allowed: false, reason: "feature_disabled" };
  }

  return { allowed: true, reason: null };
}
