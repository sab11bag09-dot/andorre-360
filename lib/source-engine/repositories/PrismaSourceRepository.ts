import { SourceAvailabilityStatus } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import {
  SourceRepository,
  type SourceForCheck,
} from "./SourceRepository";

export class PrismaSourceRepository
  implements SourceRepository
{
  async findById(
    id: number,
  ): Promise<SourceForCheck | null> {
    return prisma.source.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        url: true,
      },
    });
  }

  async markAvailable(
    sourceId: number,
    checkedAt: Date,
  ): Promise<void> {
    await prisma.source.update({
      where: {
        id: sourceId,
      },
      data: {
        availabilityStatus:
          SourceAvailabilityStatus.AVAILABLE,
        lastCheckedAt: checkedAt,
        lastSuccessAt: checkedAt,
        lastErrorAt: null,
        lastErrorMessage: null,
      },
    });
  }

  async markUnavailable(
    sourceId: number,
    checkedAt: Date,
    message: string,
  ): Promise<void> {
    await prisma.source.update({
      where: {
        id: sourceId,
      },
      data: {
        availabilityStatus:
          SourceAvailabilityStatus.UNAVAILABLE,
        lastCheckedAt: checkedAt,
        lastErrorAt: checkedAt,
        lastErrorMessage: message,
      },
    });
  }
}