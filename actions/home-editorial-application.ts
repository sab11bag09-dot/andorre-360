"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin/requireAdmin";
import { applyPreparedHomeComposition } from "@/lib/editorial/applyPreparedHomeComposition";
import { HOME_AUTOMATION_POLICY_VERSION } from "@/lib/editorial/homeAutomationPolicy";
import { rollbackAutomatedHomeComposition } from "@/lib/editorial/rollbackAutomatedHomeComposition";
import { readHomeEditorialProposalToken } from "@/lib/editorial/homeEditorialProposalToken";
import { revalidateEditorialPublicPage } from "@/lib/public-revalidation";

export type ApplyHomeEditorialProposalResult =
  | {
      success: true;
      runId: string;
      generatedAt: string;
      createdPublicationIds: number[];
      disabledPublicationIds: number[];
      preservedLockedPublicationIds: number[];
    }
  | {
      success: false;
      code: "APPLICATION_FAILED";
      message: string;
    };

export type RollbackHomeEditorialRunResult =
  | {
      success: true;
      runId: string;
      rolledBackAt: string;
      disabledPublicationIds: number[];
      restoredPublicationIds: number[];
      preservedLockedPublicationIds: number[];
    }
  | {
      success: false;
      code: "ROLLBACK_FAILED";
      message: string;
    };

function revalidateHomeEditorialPages(): void {
  revalidatePath("/admin");
  revalidatePath("/admin/editorial");
  revalidatePath("/admin/diffusion");
  revalidatePath("/admin/diffusion/simulation");
  revalidatePath("/admin/history");
  revalidateEditorialPublicPage("home");
}

export async function applyCurrentHomeEditorialProposal(
  applicationToken: string,
): Promise<ApplyHomeEditorialProposalResult> {
  const admin = await requireAdmin();

  try {
    const proposal = readHomeEditorialProposalToken(applicationToken, admin.id);

    if (proposal.policyVersion !== HOME_AUTOMATION_POLICY_VERSION) {
      throw new Error("La politique éditoriale a changé depuis la simulation.");
    }

    const runId = randomUUID();

    const application = await applyPreparedHomeComposition({
      runId,
      policyVersion: proposal.policyVersion,
      actor: admin,
      composition: proposal.composition,
      lockedPlacements: proposal.lockedPlacements,
    });

    revalidateHomeEditorialPages();

    return {
      success: true,
      runId,
      generatedAt: proposal.generatedAt.toISOString(),
      createdPublicationIds: application.createdPublicationIds,
      disabledPublicationIds: application.disabledPublicationIds,
      preservedLockedPublicationIds: application.preservedLockedPublicationIds,
    };
  } catch (error) {
    console.error(
      "L’application de la composition éditoriale de l’accueil a échoué.",
      error,
    );

    return {
      success: false,
      code: "APPLICATION_FAILED",
      message:
        "La composition n’a pas pu être appliquée. Aucun placement n’a été modifié.",
    };
  }
}

export async function rollbackHomeEditorialRun(
  runId: string,
): Promise<RollbackHomeEditorialRunResult> {
  const admin = await requireAdmin();

  try {
    const rollback = await rollbackAutomatedHomeComposition({
      runId,
      actor: admin,
    });

    revalidateHomeEditorialPages();

    return {
      success: true,
      runId: rollback.runId,
      rolledBackAt: rollback.rolledBackAt,
      disabledPublicationIds: rollback.disabledPublicationIds,
      restoredPublicationIds: rollback.restoredPublicationIds,
      preservedLockedPublicationIds: rollback.preservedLockedPublicationIds,
    };
  } catch (error) {
    console.error(
      "Le retour arrière de la composition éditoriale de l’accueil a échoué.",
      error,
    );

    return {
      success: false,
      code: "ROLLBACK_FAILED",
      message: "Le retour arrière a échoué. Aucun placement n’a été modifié.",
    };
  }
}
