import { PrismaObservationRepository } from "../source-engine/repositories/PrismaObservationRepository";
import { PrismaArticleRepository } from "./repositories/PrismaArticleRepository";

const observationRepository =
  new PrismaObservationRepository();

const articleRepository =
  new PrismaArticleRepository();

export interface CreateArticleFromObservationResult {
  articleId: number;
}

export async function createArticleFromObservation(
  observationId: number,
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
    await observationRepository.findById(
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

  const content = observation.content?.trim();

  if (!content) {
    throw new Error(
      "Le contenu collecté est insuffisant pour préparer un article.",
    );
  }

  const draft = {
    title: observation.title.trim(),
    description: content.slice(0, 250),
    content,
    category:
      observation.source.category?.trim() ||
      "Général",
    author: observation.source.name,
  };

  let articleId: number;

  if (observation.articleId !== null) {
    articleId = observation.articleId;

    await articleRepository.updateDraft(
      articleId,
      draft,
    );
  } else {
    articleId =
      await articleRepository.createDraft(
        draft,
      );
  }

  await observationRepository.markProcessed(
    observation.id,
    articleId,
  );

  return {
    articleId,
  };
}