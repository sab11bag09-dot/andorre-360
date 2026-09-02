import { OpenAiHomeCandidateAssessmentProvider } from "./OpenAiHomeCandidateAssessmentProvider";
import {
  joinFactsAndAssessments,
  type HomeCandidateAssessment,
  type HomeCandidateAssessmentProvider,
} from "./homeCandidateAssessment";
import {
  composeAutomatedHome,
  type HomeCompositionResult,
} from "./homeComposition";
import {
  loadHomeCandidateFacts,
  type HomeCandidateFacts,
} from "./loadHomeCandidateFacts";

export type AutomatedHomeSimulationOptions = {
  candidateLimit?: number;
  generatedAt?: Date;
};

export type AutomatedHomeSimulationDependencies = {
  loadCandidateFacts(limit?: number): Promise<HomeCandidateFacts[]>;
  assessmentProvider: HomeCandidateAssessmentProvider;
};

export type AutomatedHomeSimulationResult = {
  mode: "PROPOSAL_ONLY";
  generatedAt: Date;
  candidateCount: number;
  assessments: HomeCandidateAssessment[];
  composition: HomeCompositionResult;
};

function createDefaultDependencies(): AutomatedHomeSimulationDependencies {
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY est obligatoire pour simuler la composition de l’accueil.",
    );
  }

  return {
    loadCandidateFacts: loadHomeCandidateFacts,
    assessmentProvider: new OpenAiHomeCandidateAssessmentProvider({
      apiKey,
      model: process.env.OPENAI_HOME_EDITORIAL_MODEL,
    }),
  };
}

export async function simulateAutomatedHome(
  options: AutomatedHomeSimulationOptions = {},
  dependencies?: AutomatedHomeSimulationDependencies,
): Promise<AutomatedHomeSimulationResult> {
  const runtimeDependencies = dependencies ?? createDefaultDependencies();

  const facts = await runtimeDependencies.loadCandidateFacts(
    options.candidateLimit,
  );

  if (facts.length === 0) {
    return {
      mode: "PROPOSAL_ONLY",
      generatedAt: options.generatedAt ?? new Date(),
      candidateCount: 0,
      assessments: [],
      composition: composeAutomatedHome([]),
    };
  }

  const assessments =
    await runtimeDependencies.assessmentProvider.assess(facts);

  const candidates = joinFactsAndAssessments(facts, assessments);

  return {
    mode: "PROPOSAL_ONLY",
    generatedAt: options.generatedAt ?? new Date(),
    candidateCount: facts.length,
    assessments,
    composition: composeAutomatedHome(candidates),
  };
}
