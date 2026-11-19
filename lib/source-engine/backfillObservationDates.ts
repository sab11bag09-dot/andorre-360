import * as cheerio from "cheerio";

import type { PrismaClient } from "@/lib/generated/prisma/client";

import {
  extractArticlePagePublishedAt,
  parseDateFromUrl,
} from "./collectors/HtmlCollector";
import { siteRules } from "./collectors/siteRules";
import type { HtmlClient } from "./html/HtmlClient";
import { normalizeObservationPublishedAt } from "./observationDate";

/**
 * Complète la date de publication d’observations récentes collectées
 * sans date, avec les mêmes règles de lecture que la collecte HTML.
 *
 * Garanties :
 * - seules les observations sans date, non traitées, sans article et
 *   collectées récemment sont concernées ;
 * - une date déjà présente n’est jamais remplacée, y compris si elle a
 *   été renseignée entre la lecture et l’écriture ;
 * - une date future n’est jamais écrite ;
 * - le mode `dryRun` n’écrit rien.
 */

export type BackfillObservationDatesResult = {
  examined: number;
  dated: number;
  stillUndated: number;
  failed: number;
  changes: Array<{ observationId: number; publishedAt: string }>;
};

export async function backfillObservationDates(
  client: Pick<PrismaClient, "observation">,
  htmlClient: HtmlClient,
  options: {
    now?: Date;
    lookbackDays?: number;
    limit?: number;
    dryRun?: boolean;
  } = {},
): Promise<BackfillObservationDatesResult> {
  const now = options.now ?? new Date();
  const lookbackDays = options.lookbackDays ?? 7;
  const since = new Date(now.getTime() - lookbackDays * 24 * 60 * 60 * 1_000);

  const observations = await client.observation.findMany({
    where: {
      publishedAt: null,
      processed: false,
      articleId: null,
      collectedAt: { gte: since },
      source: { collectionMode: "HTML" },
    },
    orderBy: { id: "asc" },
    take: options.limit ?? 500,
    select: { id: true, url: true },
  });

  const result: BackfillObservationDatesResult = {
    examined: observations.length,
    dated: 0,
    stillUndated: 0,
    failed: 0,
    changes: [],
  };

  for (const observation of observations) {
    let pageDate: Date | null;

    try {
      const html = await htmlClient.get(observation.url);
      pageDate = extractArticlePagePublishedAt(
        cheerio.load(html),
        siteRules[new URL(observation.url).hostname],
      );
    } catch {
      result.failed += 1;
      continue;
    }

    const publishedAt = normalizeObservationPublishedAt(
      pageDate ?? parseDateFromUrl(observation.url),
      now,
    );

    if (!publishedAt) {
      result.stillUndated += 1;
      continue;
    }

    if (!options.dryRun) {
      const { count } = await client.observation.updateMany({
        where: { id: observation.id, publishedAt: null },
        data: { publishedAt },
      });

      if (count === 0) continue;
    }

    result.dated += 1;
    result.changes.push({
      observationId: observation.id,
      publishedAt: publishedAt.toISOString(),
    });
  }

  return result;
}
