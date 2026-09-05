import type { Prisma, PrismaClient } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import {
  evaluateHomeCompositionApplicationRuntime,
  readHomeCompositionApplicationRuntime,
  reserveHomeAutomationRun,
  type ReserveHomeAutomationRunInput,
} from "./applyAutomatedHomeComposition";
import { assertLockedHomePlacementsUnchanged } from "./assertLockedHomePlacementsUnchanged";
import {
  loadLockedHomePlacements,
  type LockedHomePublication,
} from "./loadLockedHomePlacements";

export type HomeAutomationTransactionInput = ReserveHomeAutomationRunInput & {
  simulatedLockedPlacements: readonly LockedHomePublication[];
};

export type HomeAutomationTransactionWork = (
  transaction: Prisma.TransactionClient,
  currentLockedPlacements: readonly LockedHomePublication[],
) => Promise<Record<string, unknown>>;

/**
 * Module interne au serveur, sans action publique.
 *
 * Le travail fourni doit utiliser exclusivement le client transactionnel.
 * Il ne doit effectuer aucun appel externe ni invalidation de cache.
 */
export async function withHomeAutomationTransaction(
  input: HomeAutomationTransactionInput,
  work: HomeAutomationTransactionWork,
  client: Pick<PrismaClient, "$transaction"> = prisma,
): Promise<Record<string, unknown>> {
  const runtime = readHomeCompositionApplicationRuntime();
  const decision = evaluateHomeCompositionApplicationRuntime(runtime);

  if (!decision.allowed) {
    throw new Error(
      decision.reason === "emergency_stop"
        ? "Application bloquée : arrêt d’urgence actif."
        : "Application de la composition désactivée.",
    );
  }

  return client.$transaction(async (transaction) => {
    const currentLockedPlacements = await loadLockedHomePlacements(
      { evaluatedAt: new Date() },
      transaction,
    );

    assertLockedHomePlacementsUnchanged(
      input.simulatedLockedPlacements,
      currentLockedPlacements,
    );

    await reserveHomeAutomationRun(
      transaction,
      input,
      readHomeCompositionApplicationRuntime(),
    );

    const result = await work(transaction, currentLockedPlacements);

    await transaction.homeAutomationRun.update({
      where: {
        id: input.runId,
      },
      data: {
        status: "APPLIED",
        appliedAt: new Date(),
        result: JSON.stringify(result),
      },
    });

    return result;
  });
}
