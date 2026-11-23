import { assessDraftQuality } from "@/lib/article-engine/draftQuality";
import { prisma } from "@/lib/prisma";

import {
  PILOT_DAYS,
  summarizePilot,
  type PilotArticleRow,
  type PilotMeasures,
  type PilotUsageRow,
} from "./pilotMeasures";

const DAY_MS = 24 * 60 * 60 * 1_000;

/** Événements de la rédaction qui peuvent modifier le texte d’un article. */
const EDIT_ACTIONS = ["ARTICLE_UPDATED", "ARTICLE_PUBLISHED", "ARTICLE_UNPUBLISHED"] as const;

function parseDetails(details: string | null): Record<string, unknown> {
  if (!details) return {};
  try {
    const parsed: unknown = JSON.parse(details);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function namesToCheck(details: Record<string, unknown>): number {
  const fidelity = details.factFidelity;
  if (!fidelity || typeof fidelity !== "object") return 0;
  const names = (fidelity as { namesToCheck?: unknown }).namesToCheck;
  return Array.isArray(names) ? names.length : 0;
}

/**
 * Charge les articles de l’IA et les appels à l’IA de la période, puis calcule
 * les mesures du pilote. Lecture seule, sans appel à l’IA.
 */
export async function loadPilotMeasures(options: { now?: Date; days?: number } = {}): Promise<PilotMeasures> {
  const now = options.now ?? new Date();
  const days = options.days ?? PILOT_DAYS;
  // Un jour de marge : le plus ancien jour affiché commence avant `now - days × 24 h`.
  const since = new Date(now.getTime() - (days + 1) * DAY_MS);

  const usages: PilotUsageRow[] = await prisma.aiUsage.findMany({
    where: { createdAt: { gte: since } },
    select: {
      createdAt: true,
      model: true,
      operation: true,
      inputTokens: true,
      outputTokens: true,
      observationId: true,
      articleId: true,
    },
  });

  const usedObservationIds = usages.flatMap((usage) => (usage.observationId === null ? [] : [usage.observationId]));
  const usedArticleIds = usages.flatMap((usage) => (usage.articleId === null ? [] : [usage.articleId]));

  // Articles de la période, et ceux dont un appel de la période relève, même rédigés plus tôt.
  const articles = await prisma.article.findMany({
    where: {
      aiRewrittenAt: { not: null },
      OR: [
        { aiRewrittenAt: { gte: since } },
        { publishedAt: { gte: since } },
        { id: { in: usedArticleIds } },
        { observations: { some: { id: { in: usedObservationIds } } } },
      ],
    },
    select: {
      id: true,
      title: true,
      description: true,
      content: true,
      category: true,
      aiRewrittenAt: true,
      published: true,
      publishedAt: true,
      observations: {
        orderBy: { id: "asc" },
        select: {
          id: true,
          title: true,
          content: true,
          publishedAt: true,
          source: { select: { name: true } },
        },
      },
      editorialEvents: {
        where: { action: { in: ["ARTICLE_CREATED", ...EDIT_ACTIONS] } },
        orderBy: { createdAt: "desc" },
        select: { action: true, actorId: true, details: true },
      },
    },
  });

  // Les appels de chaque article, même anciens, pour son coût complet.
  const articleIds = articles.map((article) => article.id);
  const observationIds = articles.flatMap((article) => article.observations.map((observation) => observation.id));
  const linkedUsages: PilotUsageRow[] = await prisma.aiUsage.findMany({
    where: {
      createdAt: { lt: since },
      OR: [{ articleId: { in: articleIds } }, { observationId: { in: observationIds } }],
    },
    select: {
      createdAt: true,
      model: true,
      operation: true,
      inputTokens: true,
      outputTokens: true,
      observationId: true,
      articleId: true,
    },
  });

  const rows: PilotArticleRow[] = articles.flatMap((article) => {
    const source = article.observations[0];
    if (!article.aiRewrittenAt || !source) return [];

    const created = article.editorialEvents.find((event) => event.action === "ARTICLE_CREATED");
    // Une retouche est un enregistrement par la rédaction qui modifie le texte.
    // Sans l’indication (événement d’avant la mesure), on compte une retouche.
    const textEdited = article.editorialEvents.some(
      (event) =>
        event.actorId !== null &&
        (EDIT_ACTIONS as readonly string[]).includes(event.action) &&
        parseDetails(event.details).textEdited !== false,
    );

    return [
      {
        id: article.id,
        category: article.category,
        generatedAt: article.aiRewrittenAt,
        publishedAt: article.published ? article.publishedAt : null,
        sourcePublishedAt: source.publishedAt,
        // Note du texte actuel : celle du brouillon de l’IA tant qu’il n’est pas retouché.
        qualityVerdict: assessDraftQuality({
          article,
          source: {
            name: source.source.name,
            title: source.title,
            content: source.content ?? "",
            publishedAt: source.publishedAt,
          },
          generatedAt: article.aiRewrittenAt,
        }).verdict,
        namesToCheck: created ? namesToCheck(parseDetails(created.details)) : 0,
        textEdited,
        observationIds: article.observations.map((observation) => observation.id),
      },
    ];
  });

  return summarizePilot(rows, [...usages, ...linkedUsages], { now, days });
}
