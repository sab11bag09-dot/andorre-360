import {
  evaluateHomeAutomationCandidate,
  type HomeAutomationCandidate,
  type HomeAutomationZone,
  type HomeCandidateEvaluation,
} from "./homeAutomationPolicy";

export const HOME_VISIBLE_ZONE_CAPACITIES = {
  hero: 1,
  feature: 1,
  "grand-format": 1,
  card: 4,
  brief: 4,
} as const;

export type HomeVisibleZone = keyof typeof HOME_VISIBLE_ZONE_CAPACITIES;

export type HomeCompositionCandidate = {
  article: HomeAutomationCandidate;
  sourceId: number;
  publishedAt: Date;
  grandFormatEligible: boolean;
};

export type LockedHomePlacement = {
  zone: HomeVisibleZone;
  candidate: HomeCompositionCandidate;
};

export type HomeCompositionPlacement = {
  zone: HomeVisibleZone;
  articleId: number;
  sourceId: number;
  category: string;
  score: number;
  origin: "LOCKED" | "AUTOMATED" | "FALLBACK";
};

export type HomeCompositionResult = {
  placements: HomeCompositionPlacement[];
  evaluations: HomeCandidateEvaluation[];
  unfilledSlots: Record<HomeVisibleZone, number>;
};

type EvaluatedCandidate = {
  candidate: HomeCompositionCandidate;
  evaluation: HomeCandidateEvaluation;
};

const AUTOMATED_ZONE_ORDER: HomeVisibleZone[] = [
  "hero",
  "grand-format",
  "feature",
  "card",
  "brief",
];

const FALLBACK_ZONE_ORDER: HomeVisibleZone[] = [
  "hero",
  "feature",
  "card",
  "brief",
];

const MAIN_ZONES = new Set<HomeVisibleZone>([
  "hero",
  "feature",
  "grand-format",
  "card",
]);

const LEADING_ZONES = new Set<HomeVisibleZone>(["hero", "feature"]);

function compareCandidates(
  left: EvaluatedCandidate,
  right: EvaluatedCandidate,
): number {
  return (
    right.evaluation.score - left.evaluation.score ||
    right.candidate.publishedAt.getTime() -
      left.candidate.publishedAt.getTime() ||
    right.candidate.article.articleId - left.candidate.article.articleId
  );
}

function compareFallbackCandidates(
  left: EvaluatedCandidate,
  right: EvaluatedCandidate,
): number {
  return (
    right.candidate.publishedAt.getTime() -
      left.candidate.publishedAt.getTime() ||
    right.candidate.article.articleId - left.candidate.article.articleId
  );
}

function isEligibleForZone(
  candidate: EvaluatedCandidate,
  zone: HomeVisibleZone,
): boolean {
  if (!candidate.evaluation.eligible) {
    return false;
  }

  if (zone === "grand-format") {
    return candidate.candidate.grandFormatEligible;
  }

  return candidate.evaluation.eligibleZones.includes(
    zone as HomeAutomationZone,
  );
}

export function composeAutomatedHome(
  candidates: HomeCompositionCandidate[],
  lockedPlacements: LockedHomePlacement[] = [],
): HomeCompositionResult {
  const evaluatedCandidates = candidates
    .map((candidate) => ({
      candidate,
      evaluation: evaluateHomeAutomationCandidate(candidate.article),
    }))
    .sort(compareCandidates);

  const fallbackCandidates = [...evaluatedCandidates].sort(
    compareFallbackCandidates,
  );

  const placements: HomeCompositionPlacement[] = [];
  const usedArticleIds = new Set<number>();
  const mainCategoryCounts = new Map<string, number>();
  const leadingSourceIds = new Set<number>();
  const zoneCounts = new Map<HomeVisibleZone, number>();

  function registerPlacement(
    zone: HomeVisibleZone,
    candidate: HomeCompositionCandidate,
    score: number,
    origin: "LOCKED" | "AUTOMATED" | "FALLBACK",
  ): void {
    if (usedArticleIds.has(candidate.article.articleId)) {
      throw new Error(
        `L’article ${candidate.article.articleId} occupe déjà un emplacement.`,
      );
    }

    const currentZoneCount = zoneCounts.get(zone) ?? 0;
    const capacity = HOME_VISIBLE_ZONE_CAPACITIES[zone];

    if (currentZoneCount >= capacity) {
      throw new Error(`La zone ${zone} dépasse sa capacité de ${capacity}.`);
    }

    usedArticleIds.add(candidate.article.articleId);
    zoneCounts.set(zone, currentZoneCount + 1);

    if (MAIN_ZONES.has(zone)) {
      mainCategoryCounts.set(
        candidate.article.category,
        (mainCategoryCounts.get(candidate.article.category) ?? 0) + 1,
      );
    }

    if (LEADING_ZONES.has(zone)) {
      leadingSourceIds.add(candidate.sourceId);
    }

    placements.push({
      zone,
      articleId: candidate.article.articleId,
      sourceId: candidate.sourceId,
      category: candidate.article.category,
      score,
      origin,
    });
  }

  for (const lockedPlacement of lockedPlacements) {
    const evaluation = evaluateHomeAutomationCandidate(
      lockedPlacement.candidate.article,
    );

    registerPlacement(
      lockedPlacement.zone,
      lockedPlacement.candidate,
      evaluation.score,
      "LOCKED",
    );
  }

  function canPlaceAutomatically(
    zone: HomeVisibleZone,
    candidate: EvaluatedCandidate,
  ): boolean {
    if (usedArticleIds.has(candidate.candidate.article.articleId)) {
      return false;
    }

    if (!isEligibleForZone(candidate, zone)) {
      return false;
    }

    if (
      MAIN_ZONES.has(zone) &&
      (mainCategoryCounts.get(candidate.candidate.article.category) ?? 0) >= 2
    ) {
      return false;
    }

    if (
      LEADING_ZONES.has(zone) &&
      leadingSourceIds.has(candidate.candidate.sourceId)
    ) {
      return false;
    }

    return true;
  }

  for (const zone of AUTOMATED_ZONE_ORDER) {
    const capacity = HOME_VISIBLE_ZONE_CAPACITIES[zone];

    while ((zoneCounts.get(zone) ?? 0) < capacity) {
      const candidate = evaluatedCandidates.find((entry) =>
        canPlaceAutomatically(zone, entry),
      );

      if (!candidate) {
        break;
      }

      registerPlacement(
        zone,
        candidate.candidate,
        candidate.evaluation.score,
        "AUTOMATED",
      );
    }
  }

  function canPlaceAsFallback(
    zone: HomeVisibleZone,
    candidate: EvaluatedCandidate,
  ): boolean {
    if (usedArticleIds.has(candidate.candidate.article.articleId)) {
      return false;
    }

    if (!candidate.evaluation.eligible) {
      return false;
    }

    if (
      MAIN_ZONES.has(zone) &&
      (mainCategoryCounts.get(candidate.candidate.article.category) ?? 0) >= 2
    ) {
      return false;
    }

    if (
      LEADING_ZONES.has(zone) &&
      leadingSourceIds.has(candidate.candidate.sourceId)
    ) {
      return false;
    }

    return true;
  }

  for (const zone of FALLBACK_ZONE_ORDER) {
    const capacity = HOME_VISIBLE_ZONE_CAPACITIES[zone];

    while ((zoneCounts.get(zone) ?? 0) < capacity) {
      const candidate = fallbackCandidates.find((entry) =>
        canPlaceAsFallback(zone, entry),
      );

      if (!candidate) {
        break;
      }

      registerPlacement(
        zone,
        candidate.candidate,
        candidate.evaluation.score,
        "FALLBACK",
      );
    }
  }

  const unfilledSlots = Object.fromEntries(
    AUTOMATED_ZONE_ORDER.map((zone) => [
      zone,
      HOME_VISIBLE_ZONE_CAPACITIES[zone] - (zoneCounts.get(zone) ?? 0),
    ]),
  ) as Record<HomeVisibleZone, number>;

  return {
    placements,
    evaluations: evaluatedCandidates.map(({ evaluation }) => evaluation),
    unfilledSlots,
  };
}
