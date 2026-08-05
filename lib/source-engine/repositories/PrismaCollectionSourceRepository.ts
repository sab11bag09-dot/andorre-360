import { prisma } from "@/lib/prisma";
import { Source } from "@/lib/generated/prisma/client";

import { CollectionSourceRepository } from "./CollectionSourceRepository";

const EMPTY_COLLECTION_ALERT_THRESHOLD = 3;

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
  ): Promise<void> {
    await prisma.source.update({
      where: { id },
      data: {
        availabilityStatus: "AVAILABLE",
        lastCheckedAt: checkedAt,
        lastSuccessAt: checkedAt,
        lastErrorMessage: null,
        consecutiveEmptyCollections: 0,
      },
    });
  }

  async markCollectionEmpty(
    id: number,
    checkedAt: Date,
  ): Promise<void> {
    const source = await prisma.source.update({
      where: { id },
      data: {
        consecutiveEmptyCollections: { increment: 1 },
        lastCheckedAt: checkedAt,
      },
      select: {
        name: true,
        consecutiveEmptyCollections: true,
      },
    });

    if (
      source.consecutiveEmptyCollections ===
      EMPTY_COLLECTION_ALERT_THRESHOLD
    ) {
      const message =
        `Alerte : ${source.name} a retourné 0 observation lors de ${source.consecutiveEmptyCollections} collectes consécutives.`;

      await prisma.source.update({
        where: { id },
        data: { lastErrorMessage: message },
      });

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
