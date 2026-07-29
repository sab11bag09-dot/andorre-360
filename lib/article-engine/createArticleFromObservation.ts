import { PrismaArticleRepository } from "./repositories/PrismaArticleRepository";
import { PrismaObservationRepository } from "../source-engine/repositories/PrismaObservationRepository";

const observationRepository = new PrismaObservationRepository();
const articleRepository = new PrismaArticleRepository();

export interface CreateArticleFromObservationResult {
  articleId: number;
}

export async function createArticleFromObservation(
  observationId: number,
): Promise<CreateArticleFromObservationResult> {
  if (!Number.isInteger(observationId) || observationId <= 0) {
    throw new Error("Identifiant d’observation invalide.");
  }

  const observation =
    await observationRepository.findById(observationId);

  if (!observation) {
    throw new Error("Observation introuvable.");
  }

  if (observation.processed) {
    throw new Error("Cette observation a déjà été traitée.");
  }

  const articleId = await articleRepository.createDraft({
    title: observation.title,
    description: observation.content?.slice(0, 250) ?? "",
    content: observation.content ?? "",
    category: observation.source.category ?? "Général",
    author: observation.source.name,
  });

  await observationRepository.markProcessed(
    observation.id,
    articleId,
  );

  return {
    articleId,
  };
}