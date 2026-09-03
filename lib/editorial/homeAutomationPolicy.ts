export const HOME_AUTOMATION_POLICY_VERSION = "1.1";

export const HOME_GRAND_FORMAT_MINIMUM_SCORE = 60;

export const HOME_STANDARD_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export const HOME_ZONE_MINIMUM_SCORES = {
  hero: 85,
  feature: 75,
  secondary: 68,
  card: 60,
  brief: 55,
} as const;

export type HomeAutomationZone = keyof typeof HOME_ZONE_MINIMUM_SCORES;

export type HomeCandidateScores = {
  andorraImportance: number;
  freshness: number;
  sourceReliability: number;
  populationImpact: number;
  editorialQuality: number;
  visualInterest: number;
  originality: number;
  explanatoryOrPracticalValue: number;
};

export type HomeAutomationCandidate = {
  articleId: number;
  category: string;
  image: string | null;
  published: boolean;
  editorialStatus: string;
  frenchPublished: boolean;
  catalanPublished: boolean;
  spanishPublished: boolean;
  sourceTrustLevel: "LOW" | "MEDIUM" | "HIGH" | "OFFICIAL";
  duplicate: boolean;
  disguisedAdvertisement: boolean;
  expired: boolean;
  contradictorySignals: boolean;
  scores: HomeCandidateScores;
};

export type HomeCandidateExclusion =
  | "ARTICLE_NOT_PUBLIC"
  | "MISSING_FRENCH_VERSION"
  | "MISSING_CATALAN_VERSION"
  | "MISSING_SPANISH_VERSION"
  | "MISSING_IMAGE"
  | "UNRELIABLE_SOURCE"
  | "FORBIDDEN_CATEGORY"
  | "DUPLICATE"
  | "DISGUISED_ADVERTISEMENT"
  | "EXPIRED_CONTENT"
  | "CONTRADICTORY_SIGNALS";

export type HomeCandidateEvaluation = {
  articleId: number;
  eligible: boolean;
  score: number;
  exclusions: HomeCandidateExclusion[];
  eligibleZones: HomeAutomationZone[];
  policyVersion: string;
};

const SCORE_MAXIMUMS: HomeCandidateScores = {
  andorraImportance: 25,
  freshness: 20,
  sourceReliability: 15,
  populationImpact: 15,
  editorialQuality: 10,
  visualInterest: 5,
  originality: 5,
  explanatoryOrPracticalValue: 5,
};

function assertValidScores(scores: HomeCandidateScores): void {
  for (const [criterion, maximum] of Object.entries(SCORE_MAXIMUMS) as Array<
    [keyof HomeCandidateScores, number]
  >) {
    const value = scores[criterion];

    if (!Number.isFinite(value) || value < 0 || value > maximum) {
      throw new RangeError(
        `Score invalide pour ${criterion} : ${value}. Maximum autorisé : ${maximum}.`,
      );
    }
  }
}

export function calculateHomeCandidateScore(
  scores: HomeCandidateScores,
): number {
  assertValidScores(scores);

  return Object.values(scores).reduce((total, value) => total + value, 0);
}

export function getEligibleHomeZones(score: number): HomeAutomationZone[] {
  return (
    Object.entries(HOME_ZONE_MINIMUM_SCORES) as Array<
      [HomeAutomationZone, number]
    >
  )
    .filter(([, minimum]) => score >= minimum)
    .map(([zone]) => zone);
}

export function evaluateHomeAutomationCandidate(
  candidate: HomeAutomationCandidate,
): HomeCandidateEvaluation {
  const exclusions: HomeCandidateExclusion[] = [];

  if (!candidate.published || candidate.editorialStatus !== "PUBLISHED") {
    exclusions.push("ARTICLE_NOT_PUBLIC");
  }

  if (!candidate.frenchPublished) {
    exclusions.push("MISSING_FRENCH_VERSION");
  }

  if (!candidate.catalanPublished) {
    exclusions.push("MISSING_CATALAN_VERSION");
  }

  if (!candidate.spanishPublished) {
    exclusions.push("MISSING_SPANISH_VERSION");
  }

  if (!candidate.image?.trim()) {
    exclusions.push("MISSING_IMAGE");
  }

  if (
    candidate.sourceTrustLevel !== "HIGH" &&
    candidate.sourceTrustLevel !== "OFFICIAL"
  ) {
    exclusions.push("UNRELIABLE_SOURCE");
  }

  if (candidate.category === "ILS_EN_PARLENT") {
    exclusions.push("FORBIDDEN_CATEGORY");
  }

  if (candidate.duplicate) {
    exclusions.push("DUPLICATE");
  }

  if (candidate.disguisedAdvertisement) {
    exclusions.push("DISGUISED_ADVERTISEMENT");
  }

  if (candidate.expired) {
    exclusions.push("EXPIRED_CONTENT");
  }

  if (candidate.contradictorySignals) {
    exclusions.push("CONTRADICTORY_SIGNALS");
  }

  const score = calculateHomeCandidateScore(candidate.scores);
  const eligible = exclusions.length === 0;

  return {
    articleId: candidate.articleId,
    eligible,
    score,
    exclusions,
    eligibleZones: eligible ? getEligibleHomeZones(score) : [],
    policyVersion: HOME_AUTOMATION_POLICY_VERSION,
  };
}
