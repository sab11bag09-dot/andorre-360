import { prisma } from "@/lib/prisma";

import { ALL_RUBRICS, chooseBankImage } from "./bankImage";

/** Choix d’une image de la banque dans la médiathèque. */

export type BankImageService = {
  pick(category: string): Promise<{ mediaId: number; path: string } | null>;
};

export const prismaBankImages: BankImageService = {
  pick: async (category) => {
    const media = await prisma.media.findMany({
      where: {
        type: "IMAGE",
        testOnly: false,
        bankCategory: { in: [category, ALL_RUBRICS] },
      },
      select: {
        id: true,
        path: true,
        bankCategory: true,
        usages: {
          where: { entityType: "ARTICLE" },
          select: { createdAt: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    const chosen = chooseBankImage(
      media.map((item) => ({
        id: item.id,
        path: item.path,
        bankCategory: item.bankCategory ?? "",
        usageCount: item.usages.length,
        lastUsedAt: item.usages[0]?.createdAt ?? null,
      })),
      category,
    );

    return chosen ? { mediaId: chosen.id, path: chosen.path } : null;
  },
};
