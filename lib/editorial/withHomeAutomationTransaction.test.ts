import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Prisma } from "@/lib/generated/prisma/client";
import type { LockedHomePublication } from "./loadLockedHomePlacements";
import type { MutableHomePublicationSnapshot } from "./loadMutableHomePublications";

const { transaction, loadLockedHomePlacements, loadMutableHomePublications } =
  vi.hoisted(() => ({
    transaction: vi.fn(),
    loadLockedHomePlacements: vi.fn(),
    loadMutableHomePublications: vi.fn(),
  }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: transaction,
  },
}));

vi.mock("./loadLockedHomePlacements", () => ({
  loadLockedHomePlacements,
}));

vi.mock("./loadMutableHomePublications", () => ({
  loadMutableHomePublications,
}));

import { HomeAutomationRunAlreadyExistsError } from "./applyAutomatedHomeComposition";
import { LockedHomePlacementsChangedError } from "./assertLockedHomePlacementsUnchanged";
import { withHomeAutomationTransaction } from "./withHomeAutomationTransaction";

function makeLockedPlacement(): LockedHomePublication {
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

function makeMutablePublication(): MutableHomePublicationSnapshot {
  return {
    publicationId: 20,
    articleId: 50,
    channel: "site",
    pageKey: "home",
    zone: "card",
    priority: 10,
    startsAt: null,
    endsAt: null,
    active: true,
    origin: "AUTOMATED",
    locked: false,
    automationScore: 80,
    automationPolicyVersion: "1.0",
    automationRunId: "ancien-run",
    updatedAt: new Date("2026-09-03T07:00:00.000Z"),
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
      actor: {
        id: "admin-1",
        email: "admin@example.com",
      },
      simulatedLockedPlacements: [makeLockedPlacement()],
    };
  }

  beforeEach(() => {
    vi.resetAllMocks();

    vi.stubEnv("AI_HOME_COMPOSITION_APPLY_ENABLED", "true");
    vi.stubEnv("AI_HOME_COMPOSITION_EMERGENCY_STOP", "false");
    vi.stubEnv("AI_AUTO_PUBLICATION_EMERGENCY_STOP", "false");

    loadLockedHomePlacements.mockResolvedValue([makeLockedPlacement()]);

    loadMutableHomePublications.mockResolvedValue([makeMutablePublication()]);

    create.mockResolvedValue({
      id: "run-123",
    });

    update.mockResolvedValue({
      id: "run-123",
    });

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

  it("construit le snapshot et réserve le run dans la transaction", async () => {
    const result = {
      createdPublicationIds: [100],
    };

    const work = vi.fn().mockResolvedValue(result);

    await expect(
      withHomeAutomationTransaction(makeInput(), work),
    ).resolves.toEqual(result);

    expect(transaction).toHaveBeenCalledTimes(1);

    expect(loadLockedHomePlacements).toHaveBeenCalledWith(
      {
        evaluatedAt: expect.any(Date),
      },
      client,
    );

    expect(loadMutableHomePublications).toHaveBeenCalledWith(client);

    expect(create).toHaveBeenCalledExactlyOnceWith({
      data: {
        id: "run-123",
        policyVersion: "1.1",
        status: "APPLYING",
        snapshot: JSON.stringify({
          publications: [makeMutablePublication()],
        }),
        actorId: "admin-1",
        actorEmail: "admin@example.com",
      },
      select: {
        id: true,
      },
    });

    expect(work).toHaveBeenCalledWith(
      client,
      [makeLockedPlacement()],
      [makeMutablePublication()],
    );

    expect(update).toHaveBeenCalledWith({
      where: {
        id: "run-123",
      },
      data: {
        status: "APPLIED",
        appliedAt: expect.any(Date),
        result: JSON.stringify(result),
      },
    });
  });

  it("respecte l’ordre de sécurité des opérations", async () => {
    const work = vi.fn().mockResolvedValue({
      createdPublicationIds: [],
    });

    await withHomeAutomationTransaction(makeInput(), work);

    expect(loadLockedHomePlacements.mock.invocationCallOrder[0]).toBeLessThan(
      loadMutableHomePublications.mock.invocationCallOrder[0],
    );

    expect(
      loadMutableHomePublications.mock.invocationCallOrder[0],
    ).toBeLessThan(create.mock.invocationCallOrder[0]);

    expect(create.mock.invocationCallOrder[0]).toBeLessThan(
      work.mock.invocationCallOrder[0],
    );

    expect(work.mock.invocationCallOrder[0]).toBeLessThan(
      update.mock.invocationCallOrder[0],
    );
  });

  it("refuse un changement humain avant de charger ou réserver le snapshot", async () => {
    loadLockedHomePlacements.mockResolvedValue([
      {
        ...makeLockedPlacement(),
        priority: 30,
      },
    ]);

    const work = vi.fn();

    await expect(
      withHomeAutomationTransaction(makeInput(), work),
    ).rejects.toBeInstanceOf(LockedHomePlacementsChangedError);

    expect(loadMutableHomePublications).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
    expect(work).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it("refuse un run déjà réservé avant d’exécuter le travail", async () => {
    create.mockRejectedValue({
      code: "P2002",
    });

    const work = vi.fn();

    await expect(
      withHomeAutomationTransaction(makeInput(), work),
    ).rejects.toBeInstanceOf(HomeAutomationRunAlreadyExistsError);

    expect(loadMutableHomePublications).toHaveBeenCalledTimes(1);
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

    const work = vi.fn().mockResolvedValue({
      createdPublicationIds: [],
    });

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
    expect(loadLockedHomePlacements).not.toHaveBeenCalled();
    expect(loadMutableHomePublications).not.toHaveBeenCalled();
    expect(work).not.toHaveBeenCalled();
  });

  it("n’ouvre aucune transaction lorsque l’application est désactivée", async () => {
    vi.stubEnv("AI_HOME_COMPOSITION_APPLY_ENABLED", "false");

    const work = vi.fn();

    await expect(
      withHomeAutomationTransaction(makeInput(), work),
    ).rejects.toThrow("Application de la composition désactivée.");

    expect(transaction).not.toHaveBeenCalled();
    expect(loadLockedHomePlacements).not.toHaveBeenCalled();
    expect(loadMutableHomePublications).not.toHaveBeenCalled();
    expect(work).not.toHaveBeenCalled();
  });
});
