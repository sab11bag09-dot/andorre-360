"use server";

import { requireAdmin } from "@/lib/admin/requireAdmin";
import type { HomeCandidateExclusion } from "@/lib/editorial/homeAutomationPolicy";
import type { HomeVisibleZone } from "@/lib/editorial/homeComposition";
import { simulateAutomatedHome } from "@/lib/editorial/simulateAutomatedHome";

const HOME_SIMULATION_CANDIDATE_LIMIT = 30;

export type HomeSimulationCandidateView = {
  articleId: number;
  title: string;
  category: string;
  sourceName: string;
  score: number;
  reasons: string[];
  exclusions: HomeCandidateExclusion[];
};

export type HomeSimulationPlacementView = HomeSimulationCandidateView & {
  zone: HomeVisibleZone;
};

export type HomeEditorialSimulationResult =
  | {
      success: true;
      mode: "PROPOSAL_ONLY";
      generatedAt: string;
      candidateCount: number;
      placements: HomeSimulationPlacementView[];
      excluded: HomeSimulationCandidateView[];
      unselected: HomeSimulationCandidateView[];
      unfilledSlots: Record<HomeVisibleZone, number>;
    }
  | {
      success: false;
      code: "SIMULATION_FAILED";
      message: string;
    };

export async function runHomeEditorialSimulation(): Promise<HomeEditorialSimulationResult> {
  await requireAdmin();

  try {
    const simulation = await simulateAutomatedHome({
      candidateLimit: HOME_SIMULATION_CANDIDATE_LIMIT,
    });

    const factsByArticleId = new Map(
      simulation.candidateFacts.map((facts) => [facts.articleId, facts]),
    );

    const assessmentsByArticleId = new Map(
      simulation.assessments.map((assessment) => [
        assessment.articleId,
        assessment,
      ]),
    );

    const evaluationsByArticleId = new Map(
      simulation.composition.evaluations.map((evaluation) => [
        evaluation.articleId,
        evaluation,
      ]),
    );

    function buildCandidateView(
      articleId: number,
    ): HomeSimulationCandidateView {
      const facts = factsByArticleId.get(articleId);
      const assessment = assessmentsByArticleId.get(articleId);
      const evaluation = evaluationsByArticleId.get(articleId);

      if (!facts || !assessment || !evaluation) {
        throw new Error(`Rapport incomplet pour l’article ${articleId}.`);
      }

      return {
        articleId,
        title: facts.title,
        category: facts.category,
        sourceName: facts.source.name,
        score: evaluation.score,
        reasons: assessment.reasons,
        exclusions: evaluation.exclusions,
      };
    }

    const placements = simulation.composition.placements.map((placement) => ({
      ...buildCandidateView(placement.articleId),
      zone: placement.zone,
    }));

    const placedArticleIds = new Set(
      placements.map(({ articleId }) => articleId),
    );

    const excluded = simulation.composition.evaluations
      .filter((evaluation) => !evaluation.eligible)
      .map((evaluation) => buildCandidateView(evaluation.articleId));

    const unselected = simulation.composition.evaluations
      .filter(
        (evaluation) =>
          evaluation.eligible && !placedArticleIds.has(evaluation.articleId),
      )
      .map((evaluation) => buildCandidateView(evaluation.articleId));

    return {
      success: true,
      mode: simulation.mode,
      generatedAt: simulation.generatedAt.toISOString(),
      candidateCount: simulation.candidateCount,
      placements,
      excluded,
      unselected,
      unfilledSlots: simulation.composition.unfilledSlots,
    };
  } catch (error) {
    console.error("La simulation éditoriale de l’accueil a échoué.", error);

    return {
      success: false,
      code: "SIMULATION_FAILED",
      message:
        "La simulation de l’accueil a échoué. Aucun placement n’a été modifié.",
    };
  }
}
