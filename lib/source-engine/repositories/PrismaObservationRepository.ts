import { prisma } from "@/lib/prisma";

import type { ObservationInput } from "../collectors/Collector";
import type { ObservationRepository } from "./ObservationRepository";

export class PrismaObservationRepository
  implements ObservationRepository
{
  async saveMany(
    sourceId: number,
    observations: ObservationInput[],
  ): Promise<number> {
    if (observations.length === 0) {
      return 0;
    }

    const result = await prisma.observation.createMany({
      data: observations.map((observation) => ({
        sourceId,
        title: observation.title,
        url: observation.url,
        publishedAt: observation.publishedAt,
        content: observation.content,
      })),
      skipDuplicates: true,
    });

    return result.count;
  }
}