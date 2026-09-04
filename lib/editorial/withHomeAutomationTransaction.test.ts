import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Prisma } from "@/lib/generated/prisma/client";
import type { LockedHomePublication } from "./loadLockedHomePlacements";

const { transaction, loadLockedHomePlacements } = vi.hoisted(() => ({
  transaction: vi.fn(),
  loadLockedHomePlacements: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: transaction,
  },
}));

vi.mock("./loadLockedHomePlacements", () => ({
  loadLockedHomePlacements,
}));

import { HomeAutomationRunAlreadyExistsError } from "./applyAutomatedHomeComposition";
import { LockedHomePlacementsChangedError } from "./assertLockedHomePlacementsUnchanged";
import { withHomeAutomationTransaction } from "./withHomeAutomationTransaction";

function makePlacement(): LockedHomePublication {
  return {
    publicationId: 10,
    articleId: 42,
    zone: "hero",
    priority: 20,
    startsAt: null,
    endsAt: null,
    updatedAt: new Date("2026-09-03T08:00:00.000Z"),
    title: "Article humain",
    category: "ACTUALITÉ",
    sourceId: 5,
    sourceName: "Source humaine",
  };
}

describe("transaction d’automatisation de l’accueil", () => {
  const create = vi.fn();
  const update = vi.fn();

  const client = {
    homeAutomationRun: {
      create,
      update,
    },
  } as unknown as Prisma.TransactionClient;

  function makeInput() {
    return {
      runId: "run-123",
      policyVersion: "1.1",
      snapshot: JSON.stringify({ publications: [] }),
      actor: {
        id: "admin-1",
        email: "admin@example.com",
      },
      simulatedLockedPlacements: [makePlacement()],
    };
  }

  beforeEach(() => {
    vi.resetAllMocks();

    vi.stubEnv("AI_HOME_COMPOSITION_APPLY_ENABLED", "true");
    vi.stubEnv("AI_HOME_COMPOSITION_EMERGENCY_STOP", "false");
    vi.stubEnv("AI_AUTO_PUBLICATION_EMERGENCY_STOP", "false");

    loadLockedHomePlacements.mockResolvedValue([makePlacement()]);
    create.mockResolvedValue({ id: "run-123" });
    update.mockResolvedValue({ id: "run-123" });

    transaction.mockImplementation(
      async (
        callback: (
          transactionClient: Prisma.TransactionClient,
        ) => Promise<unknown>,
      ) => callback(client),
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("relit, réserve et finalise avec le même client transactionnel", async () => {
    const result = { createdPublicationIds: [100] };
    const work = vi.fn().mockResolvedValue(result);

    await expect(
      withHomeAutomationTransaction(makeInput(), work),
    ).resolves.toEqual(result);

    expect(transaction).toHaveBeenCalledTimes(1);

    expect(loadLockedHomePlacements).toHaveBeenCalledWith(
      { evaluatedAt: expect.any(Date) },
      client,
    );

    expect(work).toHaveBeenCalledWith(client, [makePlacement()]);

    expect(update).toHaveBeenCalledWith({
      where: { id: "run-123" },
      data: {
        status: "APPLIED",
        appliedAt: expect.any(Date),
        result: JSON.stringify(result),
      },
    });

    expect(loadLockedHomePlacements.mock.invocationCallOrder[0]).toBeLessThan(
      create.mock.invocationCallOrder[0],
    );

    expect(create.mock.invocationCallOrder[0]).toBeLessThan(
      work.mock.invocationCallOrder[0],
    );

    expect(work.mock.invocationCallOrder[0]).toBeLessThan(
      update.mock.invocationCallOrder[0],
    );
  });

  it("refuse un changement humain avant de réserver le run", async () => {
    loadLockedHomePlacements.mockResolvedValue([
      { ...makePlacement(), priority: 30 },
    ]);

    const work = vi.fn();

    await expect(
      withHomeAutomationTransaction(makeInput(), work),
    ).rejects.toBeInstanceOf(LockedHomePlacementsChangedError);

    expect(create).not.toHaveBeenCalled();
    expect(work).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it("refuse un run déjà réservé avant d’exécuter le travail", async () => {
    create.mockRejectedValue({ code: "P2002" });
    const work = vi.fn();

    await expect(
      withHomeAutomationTransaction(makeInput(), work),
    ).rejects.toBeInstanceOf(HomeAutomationRunAlreadyExistsError);

    expect(work).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it("laisse remonter une erreur du travail hors de la transaction", async () => {
    const error = new Error("Échec pendant l’application.");
    const work = vi.fn().mockRejectedValue(error);

    await expect(withHomeAutomationTransaction(makeInput(), work)).rejects.toBe(
      error,
    );

    expect(create).toHaveBeenCalledTimes(1);
    expect(update).not.toHaveBeenCalled();
  });

  it("laisse remonter une erreur de finalisation hors de la transaction", async () => {
    const error = new Error("Échec de finalisation.");
    update.mockRejectedValue(error);
    const work = vi.fn().mockResolvedValue({ createdPublicationIds: [] });

    await expect(withHomeAutomationTransaction(makeInput(), work)).rejects.toBe(
      error,
    );
  });

  it("n’ouvre aucune transaction lorsque l’arrêt d’urgence est actif", async () => {
    vi.stubEnv("AI_HOME_COMPOSITION_EMERGENCY_STOP", "true");
    const work = vi.fn();

    await expect(
      withHomeAutomationTransaction(makeInput(), work),
    ).rejects.toThrow("Application bloquée : arrêt d’urgence actif.");

    expect(transaction).not.toHaveBeenCalled();
    expect(work).not.toHaveBeenCalled();
  });

  it("n’ouvre aucune transaction lorsque l’application est désactivée", async () => {
    vi.stubEnv("AI_HOME_COMPOSITION_APPLY_ENABLED", "false");
    const work = vi.fn();

    await expect(
      withHomeAutomationTransaction(makeInput(), work),
    ).rejects.toThrow("Application de la composition désactivée.");

    expect(transaction).not.toHaveBeenCalled();
    expect(work).not.toHaveBeenCalled();
  });
});
