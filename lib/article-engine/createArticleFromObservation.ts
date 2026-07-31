import type { ObservationRepository } from "../source-engine/repositories/ObservationRepository";
import { PrismaObservationRepository } from "../source-engine/repositories/PrismaObservationRepository";
import { DeterministicEditorialGenerator } from "./generators/DeterministicEditorialGenerator";
import type { EditorialGenerator } from "./generators/EditorialGenerator";
import type { ArticleRepository } from "./repositories/ArticleRepository";
import { PrismaArticleRepository } from "./repositories/PrismaArticleRepository";

export interface CreateArticleFromObservationResult {
  articleId: number;
}

export interface CreateArticleFromObservationDependencies {
  observationRepository: Pick<
    ObservationRepository,
    "findById" | "markProcessed"
  >;

  articleRepository: ArticleRepository;

  editorialGenerator: Pick<
    EditorialGenerator,
    "prepareArticle"
  >;
}

const defaultDependencies: CreateArticleFromObservationDependencies = {
  observationRepository:
    new PrismaObservationRepository(),

  articleRepository:
    new PrismaArticleRepository(),

  editorialGenerator:
    new DeterministicEditorialGenerator(),
};

export async function createArticleFromObservation(
  observationId: number,
  dependencies = defaultDependencies,
): Promise<CreateArticleFromObservationResult> {
  if (
    !Number.isInteger(observationId) ||
    observationId <= 0
  ) {
    throw new Error(
      "Identifiant d’observation invalide.",
    );
  }

  const observation =
    await dependencies.observationRepository.findById(
      observationId,
    );

  if (!observation) {
    throw new Error(
      "Observation introuvable.",
    );
  }

  if (
    observation.processed &&
    observation.articleId !== null
  ) {
    return {
      articleId: observation.articleId,
    };
  }

  if (observation.processed) {
    throw new Error(
      "Cette observation est marquée comme traitée sans article associé.",
    );
  }

  const content =
    observation.content?.trim();

  if (!content) {
    throw new Error(
      "Le contenu collecté est insuffisant pour préparer un article.",
    );
  }

  const draft =
    await dependencies.editorialGenerator.prepareArticle({
      originalTitle: observation.title,
      originalContent: content,
      sourceName: observation.source.name,
      sourceCategory:
        observation.source.category,
    });

  let articleId: number;

  if (observation.articleId !== null) {
    articleId = observation.articleId;

    await dependencies.articleRepository.updateDraft(
      articleId,
      draft,
    );
  } else {
    articleId =
      await dependencies.articleRepository.createDraft(
        draft,
      );
  }

  await dependencies.observationRepository.markProcessed(
    observation.id,
    articleId,
  );

  return {
    articleId,
  };
}
