export type HomeCompositionApplicationRuntime = {
  enabled: boolean;
  emergencyStop: boolean;
};

export type HomeCompositionApplicationBlockReason =
  "feature_disabled" | "emergency_stop";

export type HomeCompositionApplicationDecision =
  | {
      allowed: true;
      reason: null;
    }
  | {
      allowed: false;
      reason: HomeCompositionApplicationBlockReason;
    };

export function readHomeCompositionApplicationRuntime(
  env: Record<string, string | undefined> = process.env,
): HomeCompositionApplicationRuntime {
  return {
    enabled: env.AI_HOME_COMPOSITION_APPLY_ENABLED === "true",
    emergencyStop:
      env.AI_HOME_COMPOSITION_EMERGENCY_STOP === "true" ||
      env.AI_AUTO_PUBLICATION_EMERGENCY_STOP === "true",
  };
}

export function evaluateHomeCompositionApplicationRuntime(
  runtime: HomeCompositionApplicationRuntime,
): HomeCompositionApplicationDecision {
  if (runtime.emergencyStop) {
    return {
      allowed: false,
      reason: "emergency_stop",
    };
  }

  if (!runtime.enabled) {
    return {
      allowed: false,
      reason: "feature_disabled",
    };
  }

  return {
    allowed: true,
    reason: null,
  };
}

type HomeAutomationRunWriter = {
  homeAutomationRun: {
    create(input: {
      data: {
        id: string;
        policyVersion: string;
        status: "APPLYING";
        snapshot: string;
        actorId: string;
        actorEmail: string;
      };
      select: {
        id: true;
      };
    }): Promise<{ id: string }>;
  };
};

export type ReserveHomeAutomationRunInput = {
  runId: string;
  policyVersion: string;
  snapshot: string;
  actor: {
    id: string;
    email: string;
  };
};

export class HomeAutomationRunAlreadyExistsError extends Error {
  constructor(runId: string) {
    super(
      `Le run ${runId} existe déjà. Aucune nouvelle application autorisée.`,
    );
    this.name = "HomeAutomationRunAlreadyExistsError";
  }
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

/**
 * À appeler exclusivement avec le client de la transaction d’application.
 *
 * La clé primaire de HomeAutomationRun garantit l’unicité du run.
 * Toute erreur doit remonter hors de la transaction pour annuler ses écritures.
 */
export async function reserveHomeAutomationRun(
  transaction: HomeAutomationRunWriter,
  input: ReserveHomeAutomationRunInput,
  runtime: HomeCompositionApplicationRuntime = readHomeCompositionApplicationRuntime(),
): Promise<{ id: string }> {
  const decision = evaluateHomeCompositionApplicationRuntime(runtime);

  if (!decision.allowed) {
    throw new Error(
      decision.reason === "emergency_stop"
        ? "Application bloquée : arrêt d’urgence actif."
        : "Application de la composition désactivée.",
    );
  }

  if (!input.runId.trim()) {
    throw new Error("L’identifiant du run est obligatoire.");
  }

  if (!input.policyVersion.trim()) {
    throw new Error("La version de politique est obligatoire.");
  }

  try {
    return await transaction.homeAutomationRun.create({
      data: {
        id: input.runId,
        policyVersion: input.policyVersion,
        status: "APPLYING",
        snapshot: input.snapshot,
        actorId: input.actor.id,
        actorEmail: input.actor.email,
      },
      select: {
        id: true,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new HomeAutomationRunAlreadyExistsError(input.runId);
    }

    throw error;
  }
}
