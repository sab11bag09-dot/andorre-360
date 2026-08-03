import { CollectorFactory } from "./factories/CollectorFactory";
import { CollectorFactoryInterface } from "./factories/CollectorFactoryInterface";
import { PrismaCollectionSourceRepository } from "./repositories/PrismaCollectionSourceRepository";
import { CollectionSourceRepository } from "./repositories/CollectionSourceRepository";
import { PrismaObservationRepository } from "./repositories/PrismaObservationRepository";
import { ObservationRepository } from "./repositories/ObservationRepository";

export type CollectionResult = {
  collected: number;
  created: number;
};

const MAX_ERROR_MESSAGE_LENGTH = 1_000;

function getCollectionErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Une erreur inconnue est survenue pendant la collecte.";
  }

  const message = error.message
    .trim()
    .slice(0, MAX_ERROR_MESSAGE_LENGTH);

  return message || "Une erreur inconnue est survenue pendant la collecte.";
}

export async function collectSource(
  sourceId: number,
  repository: CollectionSourceRepository =
    new PrismaCollectionSourceRepository(),
  factory: CollectorFactoryInterface =
    new CollectorFactory(),
  observationRepository: ObservationRepository =
    new PrismaObservationRepository(),
): Promise<CollectionResult> {
  if (!Number.isInteger(sourceId) || sourceId < 1) {
    throw new Error("Identifiant de source invalide.");
  }

  const source = await repository.findById(sourceId);

  if (!source) {
    throw new Error("Source introuvable.");
  }

  try {
    const collector = factory.create(source);
    const observations = await collector.collect(source);
    const created = await observationRepository.saveMany(
      source.id,
      observations,
    );

    await repository.markCollectionSucceeded(
      source.id,
      new Date(),
    );

    return {
      collected: observations.length,
      created,
    };
  } catch (error) {
    await repository.markCollectionFailed(
      source.id,
      new Date(),
      getCollectionErrorMessage(error),
    );

    throw error;
  }
}
