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

  const collector = factory.create(source);

  const observations = await collector.collect(source);

  const created =
    await observationRepository.saveMany(
      source.id,
      observations,
    );

  return {
    collected: observations.length,
    created,
  };
}