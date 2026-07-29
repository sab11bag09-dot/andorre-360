import { ObservationInput } from "./collectors/Collector";
import { CollectorFactory } from "./factories/CollectorFactory";
import { CollectorFactoryInterface } from "./factories/CollectorFactoryInterface";
import { PrismaCollectionSourceRepository } from "./repositories/PrismaCollectionSourceRepository";
import { CollectionSourceRepository } from "./repositories/CollectionSourceRepository";

export async function collectSource(
  sourceId: number,
  repository: CollectionSourceRepository =
    new PrismaCollectionSourceRepository(),
  factory: CollectorFactoryInterface =
    new CollectorFactory(),
): Promise<ObservationInput[]> {
  if (!Number.isInteger(sourceId) || sourceId < 1) {
    throw new Error("Identifiant de source invalide.");
  }

  const source = await repository.findById(sourceId);

  if (!source) {
    throw new Error("Source introuvable.");
  }

  const collector = factory.create(source);

  return collector.collect(source);
}