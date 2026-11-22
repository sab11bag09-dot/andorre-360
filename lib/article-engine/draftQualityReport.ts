import type { EditorialStatus } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import {
  assessDraftQuality,
  type DraftQuality,
  type DraftQualityVerdict,
} from "./draftQuality";

/**
 * Rapport de qualité des articles rédigés par l’IA : chaque article est noté
 * à partir du texte de sa source (voir `draftQuality.ts`). Lecture seule,
 * sans appel à un modèle d’IA.
 */

export type DraftQualityReportEntry = {
  articleId: number;
  title: string;
  category: string;
  editorialStatus: EditorialStatus;
  sourceName: string;
  generatedAt: Date | null;
  quality: DraftQuality;
};

export type DraftQualitySummary = {
  total: number;
  averageScore: number | null;
  verdicts: Record<DraftQualityVerdict, number>;
};

const REPORT_LIMIT = 200;

export function summarizeDraftQuality(
  entries: readonly Pick<DraftQualityReportEntry, "quality">[],
): DraftQualitySummary {
  const verdicts: Record<DraftQualityVerdict, number> = { publiable: 0, "à revoir": 0, refusé: 0 };
  for (const { quality } of entries) verdicts[quality.verdict] += 1;
  const averageScore =
    entries.length === 0
      ? null
      : Math.round(entries.reduce((total, { quality }) => total + quality.score, 0) / entries.length);
  return { total: entries.length, averageScore, verdicts };
}

export async function loadDraftQualityReport(): Promise<DraftQualityReportEntry[]> {
  const articles = await prisma.article.findMany({
    where: { aiRewrittenAt: { not: null } },
    orderBy: [{ aiRewrittenAt: "desc" }, { id: "desc" }],
    take: REPORT_LIMIT,
    select: {
      id: true,
      title: true,
      description: true,
      content: true,
      category: true,
      editorialStatus: true,
      aiRewrittenAt: true,
      observations: {
        orderBy: { id: "asc" },
        take: 1,
        select: {
          title: true,
          content: true,
          publishedAt: true,
          source: { select: { name: true } },
        },
      },
    },
  });

  return articles.flatMap((article) => {
    const observation = article.observations[0];
    if (!observation) return [];

    return [
      {
        articleId: article.id,
        title: article.title,
        category: article.category,
        editorialStatus: article.editorialStatus,
        sourceName: observation.source.name,
        generatedAt: article.aiRewrittenAt,
        quality: assessDraftQuality({
          article,
          source: {
            name: observation.source.name,
            title: observation.title,
            content: observation.content ?? "",
            publishedAt: observation.publishedAt,
          },
          generatedAt: article.aiRewrittenAt,
        }),
      },
    ];
  });
}
