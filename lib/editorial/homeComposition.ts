import {
  evaluateHomeAutomationCandidate,
  HOME_GRAND_FORMAT_MINIMUM_SCORE,
  HOME_STANDARD_MAX_AGE_MS,
  type HomeAutomationCandidate,
  type HomeAutomationZone,
  type HomeCandidateEvaluation,
} from "./homeAutomationPolicy";

export const HOME_VISIBLE_ZONE_CAPACITIES = {
  hero: 1,
  feature: 1,
  "grand-format": 1,
  card: 5,
  brief: 3,
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
  articleId: number;
  sourceId: number | null;
  category: string;
  score?: number;
};

export type HomeCompositionPlacement = {
  zone: HomeVisibleZone;
  articleId: number;
  sourceId: number | null;
  category: string;
  score: number;
  origin: "LOCKED" | "AUTOMATED" | "FALLBACK";
};

export type HomeCompositionResult = {
  placements: HomeCompositionPlacement[];
  evaluations: HomeCandidateEvaluation[];
  unfilledSlots: Record<HomeVisibleZone, number>;
};

export type HomeCompositionOptions = {
  evaluatedAt?: Date;
};

type EvaluatedCandidate = {
  candidate: HomeCompositionCandidate;
  evaluation: HomeCandidateEvaluation;
};

type PlacementFacts = {
  articleId: number;
  sourceId: number | null;
  category: string;
};

const AUTOMATED_ZONE_ORDER: HomeVisibleZone[] = [
  "hero",
  "grand-format",
  "feature",
  "card",
  "brief",
];

const FALLBACK_ZONE_ORDER: HomeVisibleZone[] = ["card", "brief"];

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

function isFreshForStandardZone(
  candidate: EvaluatedCandidate,
  evaluatedAt?: Date,
): boolean {
  if (!evaluatedAt) {
    return true;
  }

  const ageMs =
    evaluatedAt.getTime() - candidate.candidate.publishedAt.getTime();

  return ageMs >= 0 && ageMs <= HOME_STANDARD_MAX_AGE_MS;
}

function isEligibleForZone(
  candidate: EvaluatedCandidate,
  zone: HomeVisibleZone,
  evaluatedAt?: Date,
): boolean {
  if (!candidate.evaluation.eligible) {
    return false;
  }

  if (zone === "grand-format") {
    return (
      candidate.candidate.grandFormatEligible &&
      candidate.evaluation.score >= HOME_GRAND_FORMAT_MINIMUM_SCORE
    );
  }

  if (!isFreshForStandardZone(candidate, evaluatedAt)) {
    return false;
  }

  return candidate.evaluation.eligibleZones.includes(
    zone as HomeAutomationZone,
  );
}

function getPlacementFacts(
  candidate: HomeCompositionCandidate,
): PlacementFacts {
  return {
    articleId: candidate.article.articleId,
    sourceId: candidate.sourceId,
    category: candidate.article.category,
  };
}

export function composeAutomatedHome(
  candidates: HomeCompositionCandidate[],
  lockedPlacements: LockedHomePlacement[] = [],
  options: HomeCompositionOptions = {},
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
    candidate: PlacementFacts,
    score: number,
    origin: "LOCKED" | "AUTOMATED" | "FALLBACK",
  ): void {
    if (usedArticleIds.has(candidate.articleId)) {
      throw new Error(
        `L’article ${candidate.articleId} occupe déjà un emplacement.`,
      );
    }

    const currentZoneCount = zoneCounts.get(zone) ?? 0;
    const capacity = HOME_VISIBLE_ZONE_CAPACITIES[zone];

    if (currentZoneCount >= capacity) {
      throw new Error(`La zone ${zone} dépasse sa capacité de ${capacity}.`);
    }

    usedArticleIds.add(candidate.articleId);
    zoneCounts.set(zone, currentZoneCount + 1);

    if (MAIN_ZONES.has(zone)) {
      mainCategoryCounts.set(
        candidate.category,
        (mainCategoryCounts.get(candidate.category) ?? 0) + 1,
      );
    }

    if (LEADING_ZONES.has(zone) && candidate.sourceId !== null) {
      leadingSourceIds.add(candidate.sourceId);
    }

    placements.push({
      zone,
      articleId: candidate.articleId,
      sourceId: candidate.sourceId,
      category: candidate.category,
      score,
      origin,
    });
  }

  for (const lockedPlacement of lockedPlacements) {
    registerPlacement(
      lockedPlacement.zone,
      lockedPlacement,
      lockedPlacement.score ?? 0,
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

    if (!isEligibleForZone(candidate, zone, options.evaluatedAt)) {
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
        getPlacementFacts(candidate.candidate),
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

    if (!isFreshForStandardZone(candidate, options.evaluatedAt)) {
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
        getPlacementFacts(candidate.candidate),
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
