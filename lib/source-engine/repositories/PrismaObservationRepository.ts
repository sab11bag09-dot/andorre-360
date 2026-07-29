import {
  Prisma,
  type Observation,
} from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import type { ObservationInput } from "../collectors/Collector";
import type {
  ObservationRepository,
  ObservationWithSource,
} from "./ObservationRepository";

function isUniqueConstraintError(
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

export class PrismaObservationRepository
  implements ObservationRepository
{
  async findById(
    id: number,
  ): Promise<ObservationWithSource | null> {
    return prisma.observation.findUnique({
      where: { id },
      include: {
        source: true,
      },
    });
  }

  async findUnprocessed(): Promise<Observation[]> {
    return prisma.observation.findMany({
      where: {
        processed: false,
      },
      orderBy: [
        {
          publishedAt: "desc",
        },
        {
          collectedAt: "desc",
        },
      ],
    });
  }

  async markProcessed(
    id: number,
    articleId: number,
  ): Promise<void> {
    await prisma.observation.update({
      where: { id },
      data: {
        processed: true,
        processedAt: new Date(),
        articleId,
      },
    });
  }

  async saveMany(
    sourceId: number,
    observations: ObservationInput[],
  ): Promise<number> {
    let created = 0;

    for (const observation of observations) {
      try {
        await prisma.observation.create({
          data: {
            sourceId,
            title: observation.title,
            url: observation.url,
            publishedAt: observation.publishedAt,
            content: observation.content,
          },
        });

        created += 1;
      } catch (error) {
        if (isUniqueConstraintError(error)) {
          continue;
        }

        throw error;
      }
    }

    return created;
  }
}