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
}