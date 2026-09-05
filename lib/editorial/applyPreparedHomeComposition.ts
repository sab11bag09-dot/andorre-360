import type { PrismaClient } from "@/lib/generated/prisma/client";

import type { HomeCompositionResult } from "./homeComposition";
import type { LockedHomePublication } from "./loadLockedHomePlacements";
import {
  withHomeAutomationTransaction,
  type HomeAutomationTransactionInput,
} from "./withHomeAutomationTransaction";
import {
  writeAutomatedHomeComposition,
  type WriteAutomatedHomeCompositionResult,
} from "./writeAutomatedHomeComposition";

export type ApplyPreparedHomeCompositionInput = Omit<
  HomeAutomationTransactionInput,
  "simulatedLockedPlacements"
> & {
  composition: HomeCompositionResult;
  lockedPlacements: readonly LockedHomePublication[];
};

export async function applyPreparedHomeComposition(
  input: ApplyPreparedHomeCompositionInput,
  client?: Pick<PrismaClient, "$transaction">,
): Promise<WriteAutomatedHomeCompositionResult> {
  const execute = withHomeAutomationTransaction(
    {
      runId: input.runId,
      policyVersion: input.policyVersion,
      actor: input.actor,
      simulatedLockedPlacements: input.lockedPlacements,
    },
    (transaction, currentLockedPlacements, mutablePublications, appliedAt) =>
      writeAutomatedHomeComposition(transaction, {
        runId: input.runId,
        policyVersion: input.policyVersion,
        appliedAt,
        placements: input.composition.placements,
        lockedPlacements: currentLockedPlacements,
        mutablePublications,
      }),
    ...(client ? [client] : []),
  );

  return execute;
}
