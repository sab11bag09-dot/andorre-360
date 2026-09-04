import { describe, expect, it, vi } from "vitest";

import {
  evaluateHomeCompositionApplicationRuntime,
  HomeAutomationRunAlreadyExistsError,
  readHomeCompositionApplicationRuntime,
  reserveHomeAutomationRun,
} from "./applyAutomatedHomeComposition";

describe("application d’une composition automatique de l’accueil", () => {
  it("est désactivée par défaut", () => {
    const runtime = readHomeCompositionApplicationRuntime({});

    expect(runtime).toEqual({
      enabled: false,
      emergencyStop: false,
    });

    expect(evaluateHomeCompositionApplicationRuntime(runtime)).toEqual({
      allowed: false,
      reason: "feature_disabled",
    });
  });

  it("donne la priorité à l’arrêt d’urgence de la composition", () => {
    const runtime = readHomeCompositionApplicationRuntime({
      AI_HOME_COMPOSITION_APPLY_ENABLED: "true",
      AI_HOME_COMPOSITION_EMERGENCY_STOP: "true",
    });

    expect(evaluateHomeCompositionApplicationRuntime(runtime)).toEqual({
      allowed: false,
      reason: "emergency_stop",
    });
  });

  it("respecte aussi l’arrêt d’urgence global de l’auto-publication", () => {
    const runtime = readHomeCompositionApplicationRuntime({
      AI_HOME_COMPOSITION_APPLY_ENABLED: "true",
      AI_AUTO_PUBLICATION_EMERGENCY_STOP: "true",
    });

    expect(evaluateHomeCompositionApplicationRuntime(runtime)).toEqual({
      allowed: false,
      reason: "emergency_stop",
    });
  });

  it("autorise l’application seulement après activation explicite", () => {
    const runtime = readHomeCompositionApplicationRuntime({
      AI_HOME_COMPOSITION_APPLY_ENABLED: "true",
    });

    expect(evaluateHomeCompositionApplicationRuntime(runtime)).toEqual({
      allowed: true,
      reason: null,
    });
  });
});

describe("réservation d’un run d’automatisation", () => {
  const input = {
    runId: "run-123",
    policyVersion: "1.1",
    snapshot: JSON.stringify({ publications: [] }),
    actor: {
      id: "admin-1",
      email: "admin@example.com",
    },
  };

  const enabledRuntime = {
    enabled: true,
    emergencyStop: false,
  };

  it("réserve le run avec son état initial et son administrateur", async () => {
    const create = vi.fn().mockResolvedValue({ id: input.runId });

    const result = await reserveHomeAutomationRun(
      { homeAutomationRun: { create } },
      input,
      enabledRuntime,
    );

    expect(result).toEqual({ id: "run-123" });
    expect(create).toHaveBeenCalledExactlyOnceWith({
      data: {
        id: "run-123",
        policyVersion: "1.1",
        status: "APPLYING",
        snapshot: input.snapshot,
        actorId: "admin-1",
        actorEmail: "admin@example.com",
      },
      select: {
        id: true,
      },
    });
  });

  it("refuse le doublon signalé par la contrainte unique de la base", async () => {
    const create = vi.fn().mockRejectedValue({
      code: "P2002",
      meta: { target: ["id"] },
    });

    await expect(
      reserveHomeAutomationRun(
        { homeAutomationRun: { create } },
        input,
        enabledRuntime,
      ),
    ).rejects.toBeInstanceOf(HomeAutomationRunAlreadyExistsError);

    expect(create).toHaveBeenCalledTimes(1);
  });

  it("propage les autres erreurs pour interrompre la transaction", async () => {
    const error = new Error("Base indisponible.");
    const create = vi.fn().mockRejectedValue(error);

    await expect(
      reserveHomeAutomationRun(
        { homeAutomationRun: { create } },
        input,
        enabledRuntime,
      ),
    ).rejects.toBe(error);
  });

  it.each([
    {
      runtime: { enabled: false, emergencyStop: false },
      message: "Application de la composition désactivée.",
    },
    {
      runtime: { enabled: true, emergencyStop: true },
      message: "Application bloquée : arrêt d’urgence actif.",
    },
  ])(
    "ne réserve rien lorsque le garde-fou bloque : $message",
    async ({ runtime, message }) => {
      const create = vi.fn();

      await expect(
        reserveHomeAutomationRun(
          { homeAutomationRun: { create } },
          input,
          runtime,
        ),
      ).rejects.toThrow(message);

      expect(create).not.toHaveBeenCalled();
    },
  );

  it.each([
    {
      overrides: { runId: " " },
      message: "L’identifiant du run est obligatoire.",
    },
    {
      overrides: { policyVersion: " " },
      message: "La version de politique est obligatoire.",
    },
  ])(
    "refuse une entrée incomplète : $message",
    async ({ overrides, message }) => {
      const create = vi.fn();

      await expect(
        reserveHomeAutomationRun(
          { homeAutomationRun: { create } },
          { ...input, ...overrides },
          enabledRuntime,
        ),
      ).rejects.toThrow(message);

      expect(create).not.toHaveBeenCalled();
    },
  );
});
