export type AutoPublicationRuntimeConfig = {
  enabled: boolean;
  emergencyStop: boolean;
  sourceIds: number[];
};

export type AutoPublicationRuntimeDecision =
  | { allowed: true; reason: null }
  | {
      allowed: false;
      reason:
        | "feature_disabled"
        | "emergency_stop"
        | "source_not_allowlisted";
    };

export function readAutoPublicationRuntimeConfig(
  env: Record<string, string | undefined> = process.env,
): AutoPublicationRuntimeConfig {
  const sourceIds = (env.AI_AUTO_PUBLICATION_SOURCE_IDS ?? "")
    .split(",")
    .map((value) => Number.parseInt(value.trim(), 10))
    .filter((value) => Number.isInteger(value) && value > 0);

  return {
    enabled: env.AI_AUTO_PUBLICATION_ENABLED === "true",
    emergencyStop: env.AI_AUTO_PUBLICATION_EMERGENCY_STOP === "true",
    sourceIds,
  };
}

export function evaluateAutoPublicationRuntime(
  config: AutoPublicationRuntimeConfig,
  sourceId?: number,
): AutoPublicationRuntimeDecision {
  if (config.emergencyStop) {
    return { allowed: false, reason: "emergency_stop" };
  }

  if (!config.enabled) {
    return { allowed: false, reason: "feature_disabled" };
  }

  if (
    config.sourceIds.length === 0 ||
    sourceId === undefined ||
    !config.sourceIds.includes(sourceId)
  ) {
    return { allowed: false, reason: "source_not_allowlisted" };
  }

  return { allowed: true, reason: null };
}
