import type { PrismaClient } from "@/lib/generated/prisma/client";
import { recordEditorialEvent } from "@/lib/editorial-history";
import { prisma } from "@/lib/prisma";

import { assertLockedHomePlacementsUnchanged } from "./assertLockedHomePlacementsUnchanged";
import { parseHomeAutomationSnapshot } from "./homeAutomationSnapshot";
import { loadLockedHomePlacements } from "./loadLockedHomePlacements";

export type HomeCompositionRollbackRuntime = {
  enabled: boolean;
  emergencyStop: boolean;
};

export type RollbackAutomatedHomeCompositionInput = {
  runId: string;
  actor: {
    id: string;
    email: string;
  };
};

export type RollbackAutomatedHomeCompositionResult = {
  runId: string;
  disabledPublicationIds: number[];
  restoredPublicationIds: number[];
  preservedLockedPublicationIds: number[];
  rolledBackAt: string;
};

export function readHomeCompositionRollbackRuntime(
  env: Record<string, string | undefined> = process.env,
): HomeCompositionRollbackRuntime {
  return {
    enabled: env.AI_HOME_COMPOSITION_ROLLBACK_ENABLED === "true",
    emergencyStop:
      env.AI_HOME_COMPOSITION_EMERGENCY_STOP === "true" ||
      env.AI_AUTO_PUBLICATION_EMERGENCY_STOP === "true",
  };
}

function assertRollbackAllowed(runtime: HomeCompositionRollbackRuntime): void {
  if (runtime.emergencyStop) {
    throw new Error("Retour arrière bloqué : arrêt d’urgence actif.");
  }

  if (!runtime.enabled) {
    throw new Error("Retour arrière de la composition désactivé.");
  }
}

export async function rollbackAutomatedHomeComposition(
  input: RollbackAutomatedHomeCompositionInput,
  client: Pick<PrismaClient, "$transaction"> = prisma,
): Promise<RollbackAutomatedHomeCompositionResult> {
  const runtime = readHomeCompositionRollbackRuntime();

  assertRollbackAllowed(runtime);

  const runId = input.runId.trim();

  if (!runId) {
    throw new Error("L’identifiant du run est obligatoire.");
  }

  const rolledBackAt = new Date();

  return client.$transaction(async (transaction) => {
    const run = await transaction.homeAutomationRun.findUnique({
      where: {
        id: runId,
      },
      select: {
        id: true,
        policyVersion: true,
        status: true,
        snapshot: true,
        appliedAt: true,
      },
    });

    if (!run) {
      throw new Error(`Le run ${runId} est introuvable.`);
    }

    if (run.status !== "APPLIED" || !run.appliedAt) {
      throw new Error(
        `Le run ${runId} ne peut pas être annulé depuis l’état ${run.status}.`,
      );
    }

    const snapshot = parseHomeAutomationSnapshot(run.snapshot);

    const currentLockedPlacements = await loadLockedHomePlacements(
      {
        evaluatedAt: rolledBackAt,
      },
      transaction,
    );

    assertLockedHomePlacementsUnchanged(
      snapshot.lockedPlacements,
      currentLockedPlacements,
    );

    const runPublications = await transaction.publication.findMany({
      where: {
        automationRunId: runId,
      },
      select: {
        id: true,
        active: true,
        locked: true,
        origin: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    const protectedPublication = runPublications.find(
      (publication) => publication.locked || publication.origin === "MANUAL",
    );

    if (protectedPublication) {
      throw new Error(
        `La publication ${protectedPublication.id} est devenue humaine et ne peut pas être désactivée.`,
      );
    }

    const changedPublication = runPublications.find(
      (publication) =>
        !publication.active ||
        (publication.origin !== "AUTOMATED" &&
          publication.origin !== "FALLBACK"),
    );

    if (changedPublication) {
      throw new Error(
        `La publication ${changedPublication.id} a changé depuis l’application.`,
      );
    }

    const disabledPublicationIds = runPublications.map(({ id }) => id);

    if (disabledPublicationIds.length > 0) {
      const deactivation = await transaction.publication.updateMany({
        where: {
          id: {
            in: disabledPublicationIds,
          },
          automationRunId: runId,
          active: true,
          locked: false,
          origin: {
            in: ["AUTOMATED", "FALLBACK"],
          },
        },
        data: {
          active: false,
          endsAt: rolledBackAt,
        },
      });

      if (deactivation.count !== disabledPublicationIds.length) {
        throw new Error(
          "Les publications du run ont changé pendant le retour arrière.",
        );
      }
    }

    const restoredPublicationIds: number[] = [];

    for (const publication of snapshot.publications) {
      const restoration = await transaction.publication.updateMany({
        where: {
          id: publication.publicationId,
          articleId: publication.articleId,
          pageKey: "home",
          channel: "site",
          active: false,
          locked: false,
          origin: publication.origin,
          endsAt: run.appliedAt,
        },
        data: {
          channel: publication.channel,
          pageKey: publication.pageKey,
          zone: publication.zone,
          priority: publication.priority,
          startsAt: publication.startsAt,
          endsAt: publication.endsAt,
          active: publication.active,
          origin: publication.origin,
          locked: false,
          automationScore: publication.automationScore,
          automationPolicyVersion: publication.automationPolicyVersion,
          automationRunId: publication.automationRunId,
        },
      });

      if (restoration.count !== 1) {
        throw new Error(
          `La publication ${publication.publicationId} ne peut pas être restaurée sans risque.`,
        );
      }

      restoredPublicationIds.push(publication.publicationId);
    }

    const result: RollbackAutomatedHomeCompositionResult = {
      runId,
      disabledPublicationIds,
      restoredPublicationIds,
      preservedLockedPublicationIds: currentLockedPlacements.map(
        ({ publicationId }) => publicationId,
      ),
      rolledBackAt: rolledBackAt.toISOString(),
    };

    await recordEditorialEvent(transaction, {
      action: "HOME_COMPOSITION_ROLLED_BACK",
      actor: input.actor,
      details: {
        policyVersion: run.policyVersion,
        ...result,
      },
    });

    const finalization = await transaction.homeAutomationRun.updateMany({
      where: {
        id: runId,
        status: "APPLIED",
      },
      data: {
        status: "ROLLED_BACK",
        rolledBackAt,
      },
    });

    if (finalization.count !== 1) {
      throw new Error(`Le run ${runId} a changé pendant le retour arrière.`);
    }

    return result;
  });
}
