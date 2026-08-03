import { prisma } from "@/lib/prisma";
import { Source } from "@/lib/generated/prisma/client";

import { CollectionSourceRepository } from "./CollectionSourceRepository";

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
      },
    });
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
