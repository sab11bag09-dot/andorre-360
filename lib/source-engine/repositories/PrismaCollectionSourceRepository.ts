import { prisma } from "@/lib/prisma";
import { Source } from "@/lib/generated/prisma/client";

import {
  type CollectionDateSummary,
  getUndatedCollectionAlert,
} from "../collectionDates";

import { CollectionSourceRepository } from "./CollectionSourceRepository";

export const EMPTY_COLLECTION_ALERT_THRESHOLD = 3;

export class PrismaCollectionSourceRepository
  implements CollectionSourceRepository
{
  async findById(
    id: number,
  ): Promise<Source | null> {
    return prisma.source.findUnique({
      where: {
        id,
      },
    });
  }

  async markCollectionSucceeded(
    id: number,
    checkedAt: Date,
    dates?: CollectionDateSummary,
  ): Promise<void> {
    const source = await prisma.source.update({
      where: { id },
      data: {
        availabilityStatus: "AVAILABLE",
        lastCheckedAt: checkedAt,
        lastSuccessAt: checkedAt,
        lastErrorMessage: null,
        consecutiveEmptyCollections: 0,
      },
      select: { name: true },
    });

    if (!dates) return;

    if (dates.futureRejected > 0) {
      console.warn("[SourceCollectionAlert]", JSON.stringify({
        sourceId: id,
        sourceName: source.name,
        futureRejected: dates.futureRejected,
        message: `${dates.futureRejected} date(s) de publication future(s) refusée(s).`,
      }));
    }

    const message = getUndatedCollectionAlert(source.name, dates);

    if (!message) return;

    // L’alerte reste affichée dans l’administration tant que les
    // collectes suivantes ne retrouvent aucune date.
    await prisma.source.update({
      where: { id },
      data: { lastErrorMessage: message },
    });

    console.warn("[SourceCollectionAlert]", JSON.stringify({
      sourceId: id,
      sourceName: source.name,
      undated: dates.undated,
      total: dates.total,
      message,
    }));
  }

  async markCollectionEmpty(
    id: number,
    checkedAt: Date,
  ): Promise<void> {
    // Le compteur n’est remis à zéro que par une collecte non vide :
    // c’est ce qui permet d’atteindre le seuil d’alerte.
    const source = await prisma.source.update({
      where: { id },
      data: {
        availabilityStatus: "AVAILABLE",
        lastCheckedAt: checkedAt,
        lastSuccessAt: checkedAt,
        consecutiveEmptyCollections: { increment: 1 },
      },
      select: {
        name: true,
        consecutiveEmptyCollections: true,
      },
    });

    const message =
      source.consecutiveEmptyCollections >=
      EMPTY_COLLECTION_ALERT_THRESHOLD
        ? `Alerte : ${source.name} a retourné 0 observation lors de ${source.consecutiveEmptyCollections} collectes consécutives.`
        : null;

    await prisma.source.update({
      where: { id },
      data: { lastErrorMessage: message },
    });

    if (
      message &&
      source.consecutiveEmptyCollections ===
        EMPTY_COLLECTION_ALERT_THRESHOLD
    ) {
      console.warn("[SourceCollectionAlert]", JSON.stringify({
        sourceId: id,
        sourceName: source.name,
        consecutiveEmptyCollections:
          source.consecutiveEmptyCollections,
        message,
      }));
    }
  }

  async markCollectionFailed(
    id: number,
    checkedAt: Date,
    message: string,
  ): Promise<void> {
    await prisma.source.update({
      where: { id },
      data: {
        availabilityStatus: "UNAVAILABLE",
        lastCheckedAt: checkedAt,
        lastErrorAt: checkedAt,
        lastErrorMessage: message,
      },
    });
  }
}
