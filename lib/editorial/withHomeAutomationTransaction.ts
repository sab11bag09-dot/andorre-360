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
import {
  loadMutableHomePublications,
  type MutableHomePublicationSnapshot,
} from "./loadMutableHomePublications";

export type HomeAutomationTransactionInput = Omit<
  ReserveHomeAutomationRunInput,
  "snapshot"
> & {
  simulatedLockedPlacements: readonly LockedHomePublication[];
};

export type HomeAutomationTransactionWork<
  Result extends Record<string, unknown> = Record<string, unknown>,
> = (
  transaction: Prisma.TransactionClient,
  currentLockedPlacements: readonly LockedHomePublication[],
  mutablePublications: readonly MutableHomePublicationSnapshot[],
  appliedAt: Date,
) => Promise<Result>;

/**
 * Module interne au serveur, sans action publique.
 *
 * Le travail fourni doit utiliser exclusivement le client transactionnel.
 * Il ne doit effectuer aucun appel externe ni invalidation de cache.
 */
export async function withHomeAutomationTransaction<
  Result extends Record<string, unknown>,
>(
  input: HomeAutomationTransactionInput,
  work: HomeAutomationTransactionWork<Result>,
  client: Pick<PrismaClient, "$transaction"> = prisma,
): Promise<Result> {
  const runtime = readHomeCompositionApplicationRuntime();
  const decision = evaluateHomeCompositionApplicationRuntime(runtime);

  if (!decision.allowed) {
    throw new Error(
      decision.reason === "emergency_stop"
        ? "Application bloquée : arrêt d’urgence actif."
        : "Application de la composition désactivée.",
    );
  }

  const appliedAt = new Date();

  return client.$transaction(async (transaction) => {
    const currentLockedPlacements = await loadLockedHomePlacements(
      { evaluatedAt: appliedAt },
      transaction,
    );

    assertLockedHomePlacementsUnchanged(
      input.simulatedLockedPlacements,
      currentLockedPlacements,
    );

    const mutablePublications = await loadMutableHomePublications(transaction);

    const snapshot = JSON.stringify({
      publications: mutablePublications,
    });

    await reserveHomeAutomationRun(
      transaction,
      {
        runId: input.runId,
        policyVersion: input.policyVersion,
        snapshot,
        actor: input.actor,
      },
      runtime,
    );

    const result = await work(
      transaction,
      currentLockedPlacements,
      mutablePublications,
      appliedAt,
    );

    await transaction.homeAutomationRun.update({
      where: {
        id: input.runId,
      },
      data: {
        status: "APPLIED",
        appliedAt,
        result: JSON.stringify(result),
      },
    });

    return result;
  });
}
