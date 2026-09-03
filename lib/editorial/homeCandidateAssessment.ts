import type { HomeCompositionCandidate } from "./homeComposition";
import type { HomeCandidateFacts } from "./loadHomeCandidateFacts";

export type HomeCandidateAssessment = {
  articleId: number;
  andorraImportance: number;
  freshness: number;
  populationImpact: number;
  editorialQuality: number;
  visualInterest: number;
  originality: number;
  explanatoryOrPracticalValue: number;
  duplicate: boolean;
  disguisedAdvertisement: boolean;
  expired: boolean;
  contradictorySignals: boolean;
  grandFormatEligible: boolean;
  reasons: string[];
};

export interface HomeCandidateAssessmentProvider {
  assess(candidates: HomeCandidateFacts[]): Promise<HomeCandidateAssessment[]>;
}

function getSourceReliabilityScore(
  trustLevel: HomeCandidateFacts["source"]["trustLevel"],
): number {
  return trustLevel === "OFFICIAL" ? 15 : 12;
}

export function buildHomeCompositionCandidate(
  facts: HomeCandidateFacts,
  assessment: HomeCandidateAssessment,
): HomeCompositionCandidate {
  if (assessment.articleId !== facts.articleId) {
    throw new Error(
      `L’évaluation de l’article ${assessment.articleId} ne correspond pas à l’article ${facts.articleId}.`,
    );
  }

  return {
    sourceId: facts.source.id,
    publishedAt: facts.publishedAt,
    grandFormatEligible: assessment.grandFormatEligible,
    article: {
      articleId: facts.articleId,
      category: facts.category,
      image: facts.image,
      published: true,
      editorialStatus: "PUBLISHED",
      frenchPublished: true,
      catalanPublished: facts.translations.catalanPublished,
      spanishPublished: facts.translations.spanishPublished,
      sourceTrustLevel: facts.source.trustLevel,
      duplicate: assessment.duplicate,
      disguisedAdvertisement: assessment.disguisedAdvertisement,
      expired: assessment.expired,
      contradictorySignals: assessment.contradictorySignals,
      scores: {
        andorraImportance: assessment.andorraImportance,
        freshness: assessment.freshness,
        sourceReliability: getSourceReliabilityScore(facts.source.trustLevel),
        populationImpact: assessment.populationImpact,
        editorialQuality: assessment.editorialQuality,
        visualInterest: assessment.visualInterest,
        originality: assessment.originality,
        explanatoryOrPracticalValue: assessment.explanatoryOrPracticalValue,
      },
    },
  };
}

export function joinFactsAndAssessments(
  facts: HomeCandidateFacts[],
  assessments: HomeCandidateAssessment[],
): HomeCompositionCandidate[] {
  const assessmentsByArticleId = new Map(
    assessments.map((assessment) => [assessment.articleId, assessment]),
  );

  if (assessmentsByArticleId.size !== assessments.length) {
    throw new Error(
      "Le fournisseur a renvoyé plusieurs évaluations pour un même article.",
    );
  }

  return facts.map((candidateFacts) => {
    const assessment = assessmentsByArticleId.get(candidateFacts.articleId);

    if (!assessment) {
      throw new Error(
        `Aucune évaluation reçue pour l’article ${candidateFacts.articleId}.`,
      );
    }

    return buildHomeCompositionCandidate(candidateFacts, assessment);
  });
}
