import { prisma } from "@/lib/prisma";

import { assessDraftQuality, type DraftQuality } from "./draftQuality";
import {
  checkAgainstReference,
  isReferenceAnnotated,
  REFERENCE_SET_TARGET_RATIO,
  type ReferenceCandidate,
  type ReferenceCheck,
} from "./referenceSet";

/**
 * Lecture du jeu de référence : chaque observation annotée, avec l’article
 * rédigé à partir d’elle s’il existe, sa note de qualité et le contrôle
 * contre l’annotation. Lecture seule, sans appel à un modèle d’IA.
 */

export type ReferenceSetEntry = {
  id: number;
  observationId: number;
  observationTitle: string;
  observationUrl: string;
  observationContent: string;
  publishedAt: Date | null;
  sourceName: string;
  category: string;
  organizationType: string;
  requiredFacts: string;
  forbiddenErrors: string;
  notes: string;
  annotated: boolean;
  article: {
    id: number;
    title: string;
    quality: DraftQuality;
    check: ReferenceCheck;
    /** Publiable selon la note et conforme à l’annotation. */
    passes: boolean;
  } | null;
};

export type ReferenceSetSummary = {
  total: number;
  annotated: number;
  /** Observations annotées qui ont un article de l’IA. */
  evaluated: number;
  passing: number;
  /** Critère de sortie de l’étape 1 atteint. */
  targetReached: boolean;
};

export function summarizeReferenceSet(entries: readonly ReferenceSetEntry[]): ReferenceSetSummary {
  const annotated = entries.filter((entry) => entry.annotated);
  const evaluated = annotated.filter((entry) => entry.article);
  const passing = evaluated.filter((entry) => entry.article?.passes).length;

  return {
    total: entries.length,
    annotated: annotated.length,
    evaluated: evaluated.length,
    passing,
    targetReached: evaluated.length > 0 && passing / evaluated.length >= REFERENCE_SET_TARGET_RATIO,
  };
}

const ENTRY_SELECT = {
  id: true,
  observationId: true,
  requiredFacts: true,
  forbiddenErrors: true,
  notes: true,
  observation: {
    select: {
      title: true,
      url: true,
      content: true,
      publishedAt: true,
      source: { select: { name: true, category: true, organizationType: true } },
      article: {
        select: {
          id: true,
          title: true,
          description: true,
          content: true,
          aiRewrittenAt: true,
        },
      },
    },
  },
} as const;

type ReferenceCaseRow = {
  id: number;
  observationId: number;
  requiredFacts: string;
  forbiddenErrors: string;
  notes: string;
  observation: {
    title: string;
    url: string;
    content: string | null;
    publishedAt: Date | null;
    source: { name: string; category: string | null; organizationType: string };
    article: {
      id: number;
      title: string;
      description: string;
      content: string;
      aiRewrittenAt: Date | null;
    } | null;
  };
};

export function toReferenceSetEntry(row: ReferenceCaseRow): ReferenceSetEntry {
  const { observation } = row;
  const annotation = { requiredFacts: row.requiredFacts, forbiddenErrors: row.forbiddenErrors };
  const annotated = isReferenceAnnotated(annotation);
  const source = observation.content ?? "";
  const article = observation.article?.aiRewrittenAt ? observation.article : null;

  let evaluated: ReferenceSetEntry["article"] = null;
  if (article) {
    const quality = assessDraftQuality({
      article,
      source: {
        name: observation.source.name,
        title: observation.title,
        content: source,
        publishedAt: observation.publishedAt,
      },
      generatedAt: article.aiRewrittenAt,
    });
    const check = checkAgainstReference(article, annotation);
    evaluated = {
      id: article.id,
      title: article.title,
      quality,
      check,
      passes: quality.verdict === "publiable" && check.conforms,
    };
  }

  return {
    id: row.id,
    observationId: row.observationId,
    observationTitle: observation.title,
    observationUrl: observation.url,
    observationContent: source,
    publishedAt: observation.publishedAt,
    sourceName: observation.source.name,
    category: observation.source.category ?? "Sans rubrique",
    organizationType: observation.source.organizationType,
    requiredFacts: row.requiredFacts,
    forbiddenErrors: row.forbiddenErrors,
    notes: row.notes,
    annotated,
    article: evaluated,
  };
}

export async function loadReferenceSet(): Promise<ReferenceSetEntry[]> {
  const rows = await prisma.referenceCase.findMany({
    where: { excludedAt: null },
    orderBy: { id: "asc" },
    select: ENTRY_SELECT,
  });
  return rows.map(toReferenceSetEntry);
}

export async function loadReferenceCase(id: number): Promise<ReferenceSetEntry | null> {
  const row = await prisma.referenceCase.findFirst({ where: { id, excludedAt: null }, select: ENTRY_SELECT });
  return row ? toReferenceSetEntry(row) : null;
}

/** Observations des sources actives, candidates au jeu de référence. */
export async function loadReferenceCandidates(): Promise<{
  candidates: ReferenceCandidate[];
  existing: ReferenceCandidate[];
}> {
  const rows = await prisma.observation.findMany({
    where: { source: { active: true }, content: { not: null } },
    select: {
      id: true,
      sourceId: true,
      title: true,
      content: true,
      publishedAt: true,
      collectedAt: true,
      referenceCase: { select: { excludedAt: true } },
      source: { select: { category: true, organizationType: true } },
    },
  });

  const candidates = rows.map((row) => ({
    id: row.id,
    sourceId: row.sourceId,
    category: row.source.category ?? "Sans rubrique",
    organizationType: row.source.organizationType,
    title: row.title,
    content: row.content ?? "",
    publishedAt: row.publishedAt,
    collectedAt: row.collectedAt,
    referenceCase: row.referenceCase,
  }));

  return {
    candidates: candidates.filter((candidate) => candidate.referenceCase === null),
    existing: candidates.filter((candidate) => candidate.referenceCase?.excludedAt === null),
  };
}
