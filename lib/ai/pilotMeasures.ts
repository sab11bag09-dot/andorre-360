import type { DraftQualityVerdict } from "@/lib/article-engine/draftQuality";

import { aiCallCostUsd } from "./aiPrices";
import { andorraDayKey, andorraDays } from "./summarizeAiUsage";

/**
 * Mesures quotidiennes du pilote (étape 3 de la feuille de route), calculées
 * sans appel à l’IA, jour par jour à l’heure d’Andorre :
 * - articles rédigés par l’IA, par rubrique, et ceux que la note juge publiables ;
 * - articles publiés, et ceux publiés sans retouche du texte par la rédaction ;
 * - noms propres à vérifier (absents de la liste de faits) et générations refusées ;
 * - coût estimé des appels à l’IA du jour, et coût moyen d’un article rédigé
 *   (tous ses appels rattachés, traductions comprises) ;
 * - délai entre la publication de la source et celle du site.
 */

export const PILOT_DAYS = 7;
const HOUR_MS = 60 * 60 * 1_000;

export type PilotArticleRow = {
  id: number;
  category: string;
  /** Rédaction (ou dernière régénération) par l’IA. */
  generatedAt: Date;
  publishedAt: Date | null;
  sourcePublishedAt: Date | null;
  qualityVerdict: DraftQualityVerdict | null;
  /** Noms propres de l’article absents de la liste de faits. */
  namesToCheck: number;
  /** La rédaction a modifié le titre, le chapô ou le texte avant ou après publication. */
  textEdited: boolean;
  observationIds: number[];
};

export type PilotUsageRow = {
  createdAt: Date;
  model: string;
  operation: string;
  inputTokens: number;
  outputTokens: number;
  observationId: number | null;
  articleId: number | null;
};

export type PilotCounts = {
  produced: number;
  byCategory: Array<{ category: string; count: number }>;
  publishable: number;
  published: number;
  publishedUnedited: number;
  withNamesToCheck: number;
  refusedGenerations: number;
  /** Coût estimé en dollars ; `null` quand aucun appel n’a de prix connu. */
  costUsd: number | null;
  /** Une partie des jetons provient d’un modèle sans prix connu. */
  costIncomplete: boolean;
  costPerArticleUsd: number | null;
  medianDelayHours: number | null;
};

export type PilotMeasures = {
  days: Array<{ day: string; label: string } & PilotCounts>;
  total: PilotCounts;
};

const GENERATION_OPERATIONS = new Set(["article_fact_sheet", "article_from_facts", "article_title"]);

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

type UsageIndex = {
  articleByObservation: ReadonlyMap<number, number>;
  /** Tous les appels rattachés à chaque article, quel que soit leur jour. */
  usagesByArticle: ReadonlyMap<number, PilotUsageRow[]>;
};

function sumCost(usages: readonly PilotUsageRow[]): { costUsd: number | null; incomplete: boolean } {
  let costUsd: number | null = null;
  let incomplete = false;
  for (const usage of usages) {
    const cost = aiCallCostUsd(usage.model, usage.inputTokens, usage.outputTokens);
    if (cost === null) {
      incomplete = true;
    } else {
      costUsd = (costUsd ?? 0) + cost;
    }
  }
  return { costUsd, incomplete };
}

function count(
  articles: readonly PilotArticleRow[],
  published: readonly PilotArticleRow[],
  usages: readonly PilotUsageRow[],
  index: UsageIndex,
): PilotCounts {
  const { articleByObservation } = index;
  const categories = new Map<string, number>();
  for (const article of articles) {
    categories.set(article.category, (categories.get(article.category) ?? 0) + 1);
  }

  // Une génération refusée a consommé des jetons pour une observation restée sans article.
  const refused = new Set(
    usages
      .filter(
        (usage) =>
          usage.observationId !== null &&
          GENERATION_OPERATIONS.has(usage.operation) &&
          !articleByObservation.has(usage.observationId),
      )
      .map((usage) => usage.observationId),
  );

  const { costUsd, incomplete: costIncomplete } = sumCost(usages);

  // Coût d’un article : ses appels rattachés (extraction, rédaction,
  // régénérations, traductions). Les appels d’avant le rattachement n’en ont pas.
  const articleCosts = articles.flatMap((article) => {
    const linked = index.usagesByArticle.get(article.id) ?? [];
    const { costUsd: cost } = sumCost(linked);
    return cost === null ? [] : [cost];
  });

  const delays = published.flatMap((article) =>
    article.publishedAt && article.sourcePublishedAt
      ? [(article.publishedAt.getTime() - article.sourcePublishedAt.getTime()) / HOUR_MS]
      : [],
  );

  return {
    produced: articles.length,
    byCategory: [...categories]
      .map(([category, total]) => ({ category, count: total }))
      .sort((left, right) => right.count - left.count || left.category.localeCompare(right.category)),
    publishable: articles.filter((article) => article.qualityVerdict === "publiable").length,
    published: published.length,
    publishedUnedited: published.filter((article) => !article.textEdited).length,
    withNamesToCheck: articles.filter((article) => article.namesToCheck > 0).length,
    refusedGenerations: refused.size,
    costUsd,
    costIncomplete,
    costPerArticleUsd:
      articleCosts.length > 0
        ? articleCosts.reduce((total, cost) => total + cost, 0) / articleCosts.length
        : null,
    medianDelayHours: median(delays.filter((delay) => delay >= 0)),
  };
}

export function summarizePilot(
  articles: readonly PilotArticleRow[],
  usages: readonly PilotUsageRow[],
  options: { now: Date; days?: number },
): PilotMeasures {
  const days = andorraDays(options.now, options.days ?? PILOT_DAYS);
  const inPeriod = new Set(days.map(({ day }) => day));

  const articleByObservation = new Map<number, number>();
  for (const article of articles) {
    for (const observationId of article.observationIds) articleByObservation.set(observationId, article.id);
  }
  const usagesByArticle = new Map<number, PilotUsageRow[]>();
  for (const usage of usages) {
    const articleId =
      usage.articleId ?? (usage.observationId !== null ? articleByObservation.get(usage.observationId) : undefined);
    if (articleId === undefined) continue;
    usagesByArticle.set(articleId, [...(usagesByArticle.get(articleId) ?? []), usage]);
  }
  const index: UsageIndex = { articleByObservation, usagesByArticle };

  const producedOn = (day: string) => articles.filter((article) => andorraDayKey(article.generatedAt) === day);
  const publishedOn = (day: string) =>
    articles.filter((article) => article.publishedAt && andorraDayKey(article.publishedAt) === day);
  const usedOn = (day: string) => usages.filter((usage) => andorraDayKey(usage.createdAt) === day);

  return {
    days: days.map((entry) => ({
      ...entry,
      ...count(producedOn(entry.day), publishedOn(entry.day), usedOn(entry.day), index),
    })),
    total: count(
      articles.filter((article) => inPeriod.has(andorraDayKey(article.generatedAt))),
      articles.filter((article) => article.publishedAt && inPeriod.has(andorraDayKey(article.publishedAt))),
      usages.filter((usage) => inPeriod.has(andorraDayKey(usage.createdAt))),
      index,
    ),
  };
}
