import type { PrismaClient } from "@/lib/generated/prisma/client";

import {
  readAutoPublicationRuntimeConfig,
  type AutoPublicationRuntimeConfig,
} from "../article-engine/autoPublicationRuntime";
import {
  DEFAULT_ARTICLE_ORCHESTRATION_POLICY,
  selectObservationsForArticles,
  type ArticleOrchestrationPolicy,
  type ObservationSelectionResult,
} from "./selectObservationsForArticles";

/**
 * Plan d’orchestration en lecture seule.
 *
 * Charge les observations récentes, applique la sélection déterministe
 * et indique si une exécution serait autorisée par la configuration.
 * Ne crée aucun article, n’appelle aucun modèle d’IA et n’écrit rien.
 */

/** Profondeur de lecture : bien au-delà de la fenêtre de fraîcheur. */
const MIN_LOOKBACK_HOURS = 7 * 24;
/** Borne dure du nombre d’observations lues par plan. */
const MAX_LOADED_OBSERVATIONS = 1_000;

export type ArticleOrchestrationBlockReason =
  | "emergency_stop"
  | "feature_disabled"
  | "no_allowlisted_source";

export type ArticleOrchestrationPlan = ObservationSelectionResult & {
  generatedAt: Date;
  loadedObservationCount: number;
  /** Une exécution réelle resterait-elle bloquée par la configuration ? */
  executionBlockedReasons: ArticleOrchestrationBlockReason[];
};

export async function planArticleOrchestration(
  client: Pick<PrismaClient, "observation" | "articleOrchestrationItem">,
  options: {
    now?: Date;
    policy?: ArticleOrchestrationPolicy;
    runtimeConfig?: AutoPublicationRuntimeConfig;
  } = {},
): Promise<ArticleOrchestrationPlan> {
  const now = options.now ?? new Date();
  const policy = options.policy ?? DEFAULT_ARTICLE_ORCHESTRATION_POLICY;
  const runtimeConfig =
    options.runtimeConfig ?? readAutoPublicationRuntimeConfig();

  const lookbackHours = Math.max(
    MIN_LOOKBACK_HOURS,
    policy.freshnessWindowHours * 2,
  );
  const since = new Date(now.getTime() - lookbackHours * 60 * 60 * 1_000);

  const observations = await client.observation.findMany({
    where: { collectedAt: { gte: since } },
    orderBy: [{ collectedAt: "desc" }, { id: "desc" }],
    take: MAX_LOADED_OBSERVATIONS,
    select: {
      id: true,
      title: true,
      url: true,
      publishedAt: true,
      content: true,
      processed: true,
      articleId: true,
      source: {
        select: {
          id: true,
          url: true,
          active: true,
          publicationMode: true,
          trustLevel: true,
          organizationType: true,
        },
      },
    },
  });

  const attemptedItems = await client.articleOrchestrationItem.findMany({
    where: { observationId: { in: observations.map(({ id }) => id) } },
    select: { observationId: true },
  });

  const selection = selectObservationsForArticles({
    observations,
    allowlistedSourceIds: runtimeConfig.sourceIds,
    attemptedObservationIds: attemptedItems.map(({ observationId }) => observationId),
    now,
    policy,
  });

  const executionBlockedReasons: ArticleOrchestrationBlockReason[] = [];
  if (runtimeConfig.emergencyStop) executionBlockedReasons.push("emergency_stop");
  if (!runtimeConfig.enabled) executionBlockedReasons.push("feature_disabled");
  if (runtimeConfig.sourceIds.length === 0) {
    executionBlockedReasons.push("no_allowlisted_source");
  }

  return {
    ...selection,
    generatedAt: now,
    loadedObservationCount: observations.length,
    executionBlockedReasons,
  };
}
