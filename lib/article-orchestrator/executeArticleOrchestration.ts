import { Prisma, type PrismaClient } from "@/lib/generated/prisma/client";

import { readAutoPublicationRuntimeConfig } from "../article-engine/autoPublicationRuntime";
import {
  planArticleOrchestration,
  type ArticleOrchestrationBlockReason,
} from "./planArticleOrchestration";
import {
  DEFAULT_ARTICLE_ORCHESTRATION_POLICY,
  type ArticleOrchestrationPolicy,
} from "./selectObservationsForArticles";

/**
 * Exécution de l’orchestrateur autonome des articles.
 *
 * Deux modes :
 * - brouillons seulement (par défaut) : les articles restent en brouillon,
 *   sans publication ni traduction ; la publication automatique n’a pas à
 *   être activée ;
 * - publication (`AI_ARTICLE_ORCHESTRATOR_PUBLISH=true`) : la création
 *   d’article peut publier, si `AI_AUTO_PUBLICATION_ENABLED=true` et si
 *   ses propres règles l’autorisent.
 *
 * Garanties :
 * - rien n’est généré sans `AI_ARTICLE_ORCHESTRATOR_ENABLED=true`, sans
 *   source autorisée ou pendant l’arrêt d’urgence, quel que soit le mode ;
 * - une seule exécution à la fois (verrou unique en base) ;
 * - chaque observation est réservée durablement avant toute génération :
 *   elle ne peut jamais déclencher deux générations, même après relance ;
 * - une erreur reste limitée à son observation et n’est jamais relancée
 *   automatiquement : une génération partielle pourrait sinon créer un
 *   second brouillon ;
 * - l’arrêt d’urgence est relu avant chaque observation.
 *
 * Chaque génération réelle appelle OpenAI et engage donc un coût.
 */

const ACTIVE_LOCK = "active";
const MAX_ERROR_MESSAGE_LENGTH = 500;

export type ArticleOrchestrationExecutionBlockReason =
  | ArticleOrchestrationBlockReason
  | "orchestrator_disabled";

export type ArticleOrchestrationMode = "DRAFTS_ONLY" | "PUBLISH";

export function readArticleOrchestrationMode(
  env: Record<string, string | undefined>,
): ArticleOrchestrationMode {
  return env.AI_ARTICLE_ORCHESTRATOR_PUBLISH === "true" ? "PUBLISH" : "DRAFTS_ONLY";
}

/**
 * Garde-fous fermés pour un mode donné. L’activation de la publication
 * automatique n’est exigée qu’en mode publication.
 */
export function articleOrchestrationBlockers(
  env: Record<string, string | undefined>,
  planReasons: ArticleOrchestrationBlockReason[],
): ArticleOrchestrationExecutionBlockReason[] {
  const mode = readArticleOrchestrationMode(env);
  const reasons: ArticleOrchestrationExecutionBlockReason[] = planReasons.filter(
    (reason) => mode === "PUBLISH" || reason !== "feature_disabled",
  );

  if (!isArticleOrchestratorEnabled(env)) reasons.push("orchestrator_disabled");

  return reasons;
}

export type ArticleOrchestrationItemOutcome =
  | { observationId: number; status: "CREATED"; articleId: number }
  | { observationId: number; status: "FAILED"; errorMessage: string }
  | { observationId: number; status: "ALREADY_ATTEMPTED" }
  | { observationId: number; status: "STOPPED" };

export type ArticleOrchestrationExecutionResult =
  | {
      status: "BLOCKED";
      mode: ArticleOrchestrationMode;
      runId: string;
      blockedReasons: ArticleOrchestrationExecutionBlockReason[];
      items: [];
    }
  | {
      status: "ALREADY_RUNNING";
      mode: ArticleOrchestrationMode;
      runId: null;
      blockedReasons: [];
      items: [];
    }
  | {
      /** La sélection diffère de l’aperçu examiné : rien n’est généré. */
      status: "PLAN_CHANGED";
      mode: ArticleOrchestrationMode;
      runId: null;
      blockedReasons: [];
      items: [];
      selectedObservationIds: number[];
    }
  | {
      status: "COMPLETED";
      mode: ArticleOrchestrationMode;
      runId: string;
      blockedReasons: [];
      items: ArticleOrchestrationItemOutcome[];
    };

type OrchestrationClient = Pick<
  PrismaClient,
  "observation" | "articleOrchestrationRun" | "articleOrchestrationItem"
>;

export type ExecuteArticleOrchestrationOptions = {
  now?: Date;
  env?: Record<string, string | undefined>;
  policy?: ArticleOrchestrationPolicy;
  createArticle?: (
    observationId: number,
    options: { allowAutoPublication: boolean },
  ) => Promise<{ articleId: number }>;
  sleep?: (ms: number) => Promise<void>;
  delayBetweenArticlesMs?: number;
  /** Administrateur à l’origine du lancement, enregistré dans le run. */
  actor?: { id: string; email: string };
  /**
   * Sélection affichée dans l’aperçu examiné. Si elle est fournie et
   * diffère de la sélection recalculée, aucune génération n’a lieu.
   */
  expectedSelectedObservationIds?: number[];
};

export function isArticleOrchestratorEnabled(
  env: Record<string, string | undefined>,
): boolean {
  return env.AI_ARTICLE_ORCHESTRATOR_ENABLED === "true";
}

export async function executeArticleOrchestration(
  client: OrchestrationClient,
  options: ExecuteArticleOrchestrationOptions = {},
): Promise<ArticleOrchestrationExecutionResult> {
  const env = options.env ?? process.env;
  const now = options.now ?? new Date();
  const policy = options.policy ?? DEFAULT_ARTICLE_ORCHESTRATION_POLICY;
  const createArticle = options.createArticle ?? createArticleAutonomously;
  const sleep = options.sleep ?? defaultSleep;
  const delayMs = Math.max(0, options.delayBetweenArticlesMs ?? 1_000);
  const mode = readArticleOrchestrationMode(env);

  const plan = await planArticleOrchestration(client, {
    now,
    policy,
    runtimeConfig: readAutoPublicationRuntimeConfig(env),
  });

  if (
    options.expectedSelectedObservationIds &&
    !sameIds(options.expectedSelectedObservationIds, plan.selectedObservationIds)
  ) {
    return {
      status: "PLAN_CHANGED",
      mode,
      runId: null,
      blockedReasons: [],
      items: [],
      selectedObservationIds: plan.selectedObservationIds,
    };
  }

  const blockedReasons = articleOrchestrationBlockers(
    env,
    plan.executionBlockedReasons,
  );

  const runId = crypto.randomUUID();
  const serializedPlan = JSON.stringify({
    generatedAt: plan.generatedAt,
    loadedObservationCount: plan.loadedObservationCount,
    selectedObservationIds: plan.selectedObservationIds,
    decisions: plan.decisions,
  });

  if (blockedReasons.length > 0) {
    await client.articleOrchestrationRun.create({
      data: {
        id: runId,
        status: "BLOCKED",
        policy: JSON.stringify(policy),
        plan: serializedPlan,
        result: JSON.stringify({ mode, blockedReasons }),
        actorId: options.actor?.id,
        actorEmail: options.actor?.email,
        finishedAt: new Date(),
      },
    });
    return { status: "BLOCKED", mode, runId, blockedReasons, items: [] };
  }

  try {
    await client.articleOrchestrationRun.create({
      data: {
        id: runId,
        status: "RUNNING",
        activeLock: ACTIVE_LOCK,
        policy: JSON.stringify(policy),
        plan: serializedPlan,
        actorId: options.actor?.id,
        actorEmail: options.actor?.email,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        status: "ALREADY_RUNNING",
        mode,
        runId: null,
        blockedReasons: [],
        items: [],
      };
    }
    throw error;
  }

  const items: ArticleOrchestrationItemOutcome[] = [];

  try {
    let generations = 0;

    for (const observationId of plan.selectedObservationIds) {
      if (!isStillAllowed(env, mode)) {
        items.push({ observationId, status: "STOPPED" });
        continue;
      }

      try {
        await client.articleOrchestrationItem.create({
          data: { runId, observationId },
        });
      } catch (error) {
        if (isUniqueConstraintError(error)) {
          items.push({ observationId, status: "ALREADY_ATTEMPTED" });
          continue;
        }
        throw error;
      }

      if (generations > 0 && delayMs > 0) await sleep(delayMs);
      generations += 1;

      try {
        const { articleId } = await createArticle(observationId, {
          allowAutoPublication: mode === "PUBLISH",
        });
        await client.articleOrchestrationItem.update({
          where: { observationId },
          data: { status: "CREATED", articleId },
        });
        items.push({ observationId, status: "CREATED", articleId });
      } catch (error) {
        const errorMessage = normalizeError(error);
        await client.articleOrchestrationItem.update({
          where: { observationId },
          data: { status: "FAILED", errorMessage },
        });
        items.push({ observationId, status: "FAILED", errorMessage });
      }
    }
  } catch (error) {
    await client.articleOrchestrationRun.update({
      where: { id: runId },
      data: {
        status: "FAILED",
        activeLock: null,
        finishedAt: new Date(),
        result: JSON.stringify({ mode, items, error: normalizeError(error) }),
      },
    });
    throw error;
  }

  await client.articleOrchestrationRun.update({
    where: { id: runId },
    data: {
      status: "COMPLETED",
      activeLock: null,
      finishedAt: new Date(),
      result: JSON.stringify({ mode, items }),
    },
  });

  return { status: "COMPLETED", mode, runId, blockedReasons: [], items };
}

function sameIds(left: number[], right: number[]): boolean {
  if (left.length !== right.length) return false;
  const sortedLeft = [...left].sort((a, b) => a - b);
  const sortedRight = [...right].sort((a, b) => a - b);
  return sortedLeft.every((id, index) => id === sortedRight[index]);
}

/** Relu avant chaque observation : le mode reste celui du début du run. */
function isStillAllowed(
  env: Record<string, string | undefined>,
  mode: ArticleOrchestrationMode,
): boolean {
  const runtime = readAutoPublicationRuntimeConfig(env);
  return (
    isArticleOrchestratorEnabled(env) &&
    !runtime.emergencyStop &&
    (mode === "DRAFTS_ONLY" || runtime.enabled)
  );
}

export async function createArticleAutonomously(
  observationId: number,
  options: { allowAutoPublication: boolean },
): Promise<{ articleId: number }> {
  const { createArticleFromObservation } = await import(
    "../article-engine/createArticleFromObservation"
  );
  // En mode publication, l’orchestrateur se déclare explicitement et la
  // création réévalue ses propres règles. En mode brouillons, la
  // publication automatique est refusée par construction.
  return createArticleFromObservation(observationId, undefined, {
    allowAutoPublication: options.allowAutoPublication,
  });
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

function normalizeError(error: unknown): string {
  const message = error instanceof Error ? error.message.trim() : "";
  return (message || "Erreur inconnue").slice(0, MAX_ERROR_MESSAGE_LENGTH);
}

function defaultSleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
