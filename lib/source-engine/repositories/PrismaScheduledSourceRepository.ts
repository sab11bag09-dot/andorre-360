import { prisma } from "@/lib/prisma";

import type {
  ScheduledSource,
  ScheduledSourceRepository,
} from "./ScheduledSourceRepository";

export class PrismaScheduledSourceRepository
  implements ScheduledSourceRepository
{
  async findActive(): Promise<ScheduledSource[]> {
    return prisma.source.findMany({
      where: { active: true },
      select: {
        id: true,
        checkIntervalMinutes: true,
        lastCheckedAt: true,
      },
      orderBy: [{ lastCheckedAt: "asc" }, { id: "asc" }],
    });
  }

  async claim(
    source: ScheduledSource,
    claimedAt: Date,
  ): Promise<boolean> {
    const result = await prisma.source.updateMany({
      where: {
        id: source.id,
        active: true,
        lastCheckedAt: source.lastCheckedAt,
      },
      data: {
        lastCheckedAt: claimedAt,
      },
    });

    return result.count === 1;
  }
}
