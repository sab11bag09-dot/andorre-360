"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin/requireAdmin";
import { aiBudgetStatus } from "@/lib/ai/aiUsageBudget";
import { createPrismaAiUsageLedger } from "@/lib/ai/prismaAiUsageLedger";
import {
  articleOrchestrationBlockers,
  executeArticleOrchestration,
  readArticleOrchestrationMode,
  type ArticleOrchestrationExecutionBlockReason,
  type ArticleOrchestrationMode,
} from "@/lib/article-orchestrator/executeArticleOrchestration";
import { planArticleOrchestration } from "@/lib/article-orchestrator/planArticleOrchestration";
import {
  DEFAULT_ARTICLE_ORCHESTRATION_POLICY,
  type ObservationSelectionReason,
} from "@/lib/article-orchestrator/selectObservationsForArticles";
import { prisma } from "@/lib/prisma";

/** Nombre maximal d’observations écartées détaillées dans l’aperçu. */
const MAX_DETAILED_SKIPPED = 30;

/** Motifs attendus et peu informatifs : comptés, mais non détaillés. */
const ROUTINE_REASONS: ReadonlySet<ObservationSelectionReason> = new Set([
  "already_processed",
  "already_linked_to_article",
  "already_attempted_by_orchestrator",
]);

export type ArticleOrchestrationObservationView = {
  observationId: number;
  title: string;
  sourceName: string;
  url: string;
  publishedAt: string | null;
  reasons: ObservationSelectionReason[];
};

export type ArticleOrchestrationPreviewResult =
  | {
      success: true;
      mode: ArticleOrchestrationMode;
      generatedAt: string;
      loadedObservationCount: number;
      maxSelected: number;
      selected: ArticleOrchestrationObservationView[];
      skippedCount: number;
      routineSkippedCount: number;
      skippedByReason: Partial<Record<ObservationSelectionReason, number>>;
      detailedSkipped: ArticleOrchestrationObservationView[];
      blockedReasons: ArticleOrchestrationExecutionBlockReason[];
    }
  | { success: false; code: "PREVIEW_FAILED"; message: string };

export type ArticleOrchestrationLaunchItemView = {
  observationId: number;
  title: string;
  status: "CREATED" | "FAILED" | "ALREADY_ATTEMPTED" | "STOPPED";
  articleId: number | null;
  errorMessage: string | null;
};

export type ArticleOrchestrationLaunchResult =
  | {
      success: true;
      mode: ArticleOrchestrationMode;
      runId: string;
      items: ArticleOrchestrationLaunchItemView[];
    }
  | {
      success: false;
      code:
        | "INVALID_REQUEST"
        | "BLOCKED"
        | "ALREADY_RUNNING"
        | "PLAN_CHANGED"
        | "LAUNCH_FAILED";
      message: string;
    };

async function loadObservationLabels(ids: number[]) {
  if (ids.length === 0) return new Map<number, { title: string; url: string; publishedAt: Date | null; sourceName: string }>();

  const observations = await prisma.observation.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      title: true,
      url: true,
      publishedAt: true,
      source: { select: { name: true } },
    },
  });

  return new Map(
    observations.map((observation) => [
      observation.id,
      {
        title: observation.title,
        url: observation.url,
        publishedAt: observation.publishedAt,
        sourceName: observation.source.name,
      },
    ]),
  );
}

export async function previewArticleOrchestration(): Promise<ArticleOrchestrationPreviewResult> {
  await requireAdmin();

  try {
    const plan = await planArticleOrchestration(prisma);
    const skipped = plan.decisions.filter(
      (decision) => decision.status === "skipped",
    );
    const routine = skipped.filter((decision) =>
      decision.reasons.every((reason) => ROUTINE_REASONS.has(reason)),
    );
    const informative = skipped
      .filter((decision) => !routine.includes(decision))
      .sort((left, right) => right.observationId - left.observationId)
      .slice(0, MAX_DETAILED_SKIPPED);

    const skippedByReason: Partial<Record<ObservationSelectionReason, number>> = {};
    for (const decision of skipped) {
      for (const reason of decision.reasons) {
        skippedByReason[reason] = (skippedByReason[reason] ?? 0) + 1;
      }
    }

    const labels = await loadObservationLabels([
      ...plan.selectedObservationIds,
      ...informative.map(({ observationId }) => observationId),
    ]);
    const reasonsById = new Map(
      plan.decisions.map((decision) => [decision.observationId, decision.reasons]),
    );
    const toView = (observationId: number): ArticleOrchestrationObservationView => {
      const label = labels.get(observationId);
      return {
        observationId,
        title: label?.title ?? `Observation ${observationId}`,
        sourceName: label?.sourceName ?? "Source inconnue",
        url: label?.url ?? "",
        publishedAt: label?.publishedAt?.toISOString() ?? null,
        reasons: reasonsById.get(observationId) ?? [],
      };
    };

    const blockedReasons = articleOrchestrationBlockers(
      process.env,
      plan.executionBlockedReasons,
    );
    const budget = await aiBudgetStatus(createPrismaAiUsageLedger(prisma));
    if (!budget.available) blockedReasons.push("ai_budget_exceeded");

    return {
      success: true,
      mode: readArticleOrchestrationMode(process.env),
      generatedAt: plan.generatedAt.toISOString(),
      loadedObservationCount: plan.loadedObservationCount,
      maxSelected: plan.policy.maxSelected,
      selected: plan.selectedObservationIds.map(toView),
      skippedCount: skipped.length,
      routineSkippedCount: routine.length,
      skippedByReason,
      detailedSkipped: informative.map(({ observationId }) => toView(observationId)),
      blockedReasons,
    };
  } catch {
    return {
      success: false,
      code: "PREVIEW_FAILED",
      message: "L’aperçu de l’orchestrateur n’a pas pu être calculé.",
    };
  }
}

export async function launchArticleOrchestration(
  expectedSelectedObservationIds: number[],
): Promise<ArticleOrchestrationLaunchResult> {
  const admin = await requireAdmin();

  if (
    !Array.isArray(expectedSelectedObservationIds) ||
    expectedSelectedObservationIds.length === 0 ||
    expectedSelectedObservationIds.length >
      DEFAULT_ARTICLE_ORCHESTRATION_POLICY.maxSelected ||
    !expectedSelectedObservationIds.every(
      (id) => Number.isInteger(id) && id > 0,
    ) ||
    new Set(expectedSelectedObservationIds).size !==
      expectedSelectedObservationIds.length
  ) {
    return {
      success: false,
      code: "INVALID_REQUEST",
      message: "Aucune sélection valide à lancer. Recalculez l’aperçu.",
    };
  }

  try {
    const result = await executeArticleOrchestration(prisma, {
      actor: admin,
      expectedSelectedObservationIds,
    });

    revalidatePath("/admin/diffusion/orchestrateur");
    revalidatePath("/admin/observations");
    revalidatePath("/admin/articles");

    if (result.status === "BLOCKED") {
      return {
        success: false,
        code: "BLOCKED",
        message: "L’exécution est bloquée par les garde-fous serveur. Aucun article n’a été généré.",
      };
    }
    if (result.status === "ALREADY_RUNNING") {
      return {
        success: false,
        code: "ALREADY_RUNNING",
        message: "Une exécution est déjà en cours. Aucun article n’a été généré.",
      };
    }
    if (result.status === "PLAN_CHANGED") {
      return {
        success: false,
        code: "PLAN_CHANGED",
        message: "La sélection a changé depuis l’aperçu. Aucun article n’a été généré : recalculez l’aperçu.",
      };
    }

    const labels = await loadObservationLabels(
      result.items.map(({ observationId }) => observationId),
    );

    return {
      success: true,
      mode: result.mode,
      runId: result.runId,
      items: result.items.map((item) => ({
        observationId: item.observationId,
        title: labels.get(item.observationId)?.title ?? `Observation ${item.observationId}`,
        status: item.status,
        articleId: item.status === "CREATED" ? item.articleId : null,
        errorMessage: item.status === "FAILED" ? item.errorMessage : null,
      })),
    };
  } catch {
    return {
      success: false,
      code: "LAUNCH_FAILED",
      message: "L’exécution a échoué. Consultez le run enregistré avant toute nouvelle tentative.",
    };
  }
}
