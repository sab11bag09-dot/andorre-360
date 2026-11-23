import { summarizeCollectionDates } from "./collectionDates";
import { CollectorFactory } from "./factories/CollectorFactory";
import { CollectorFactoryInterface } from "./factories/CollectorFactoryInterface";
import { PrismaCollectionSourceRepository } from "./repositories/PrismaCollectionSourceRepository";
import { CollectionSourceRepository } from "./repositories/CollectionSourceRepository";
import { PrismaObservationRepository } from "./repositories/PrismaObservationRepository";
import { ObservationRepository } from "./repositories/ObservationRepository";
import { robotsPolicy, type RobotsPolicy } from "./robots/robotsPolicy";

export type CollectionResult = {
  collected: number;
  created: number;
  /** Observations collectées sans date exploitable. */
  undated: number;
  /** Dont dates refusées parce que trop loin dans le futur. */
  futureRejected: number;
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
  robots: Pick<RobotsPolicy, "assertAiInputAllowed"> = robotsPolicy,
): Promise<CollectionResult> {
  if (!Number.isInteger(sourceId) || sourceId < 1) {
    throw new Error("Identifiant de source invalide.");
  }

  const source = await repository.findById(sourceId);

  if (!source) {
    throw new Error("Source introuvable.");
  }

  try {
    // Une source qui refuse l’usage de ses contenus par l’IA n’est pas
    // collectée : ses textes serviraient à rédiger des articles.
    await robots.assertAiInputAllowed(source.url);

    const collector = factory.create(source);
    const observations = await collector.collect(source);
    const created = await observationRepository.saveMany(
      source.id,
      observations,
    );

    const checkedAt = new Date();
    const dates = summarizeCollectionDates(observations, checkedAt);

    if (observations.length === 0 && repository.markCollectionEmpty) {
      await repository.markCollectionEmpty(source.id, checkedAt);
    } else {
      await repository.markCollectionSucceeded(
        source.id,
        checkedAt,
        dates,
      );
    }

    return {
      collected: observations.length,
      created,
      undated: dates.undated,
      futureRejected: dates.futureRejected,
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
