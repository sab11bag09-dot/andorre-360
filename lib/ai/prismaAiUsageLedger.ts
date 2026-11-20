import type { PrismaClient } from "@/lib/generated/prisma/client";

import type { AiUsageLedger } from "./aiUsageBudget";

export function createPrismaAiUsageLedger(
  client: Pick<PrismaClient, "aiUsage">,
): AiUsageLedger {
  return {
    async tokensUsedSince(since) {
      const result = await client.aiUsage.aggregate({
        where: { createdAt: { gte: since } },
        _sum: { totalTokens: true },
      });

      return result._sum.totalTokens ?? 0;
    },

    async record(entry) {
      await client.aiUsage.create({
        data: { ...entry, totalTokens: entry.inputTokens + entry.outputTokens },
      });
    },
  };
}

/**
 * Registre de la base de l’application, chargé seulement au premier appel :
 * importer un client OpenAI ne doit pas ouvrir la base.
 */
export const defaultAiUsageLedger: AiUsageLedger = {
  async tokensUsedSince(since) {
    const { prisma } = await import("@/lib/prisma");
    return createPrismaAiUsageLedger(prisma).tokensUsedSince(since);
  },
  async record(entry) {
    const { prisma } = await import("@/lib/prisma");
    return createPrismaAiUsageLedger(prisma).record(entry);
  },
};
