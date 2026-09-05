import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  transaction,
  runFindUnique,
  runUpdateMany,
  publicationFindMany,
  publicationUpdateMany,
  editorialEventCreate,
  loadLockedHomePlacements,
} = vi.hoisted(() => ({
  transaction: vi.fn(),
  runFindUnique: vi.fn(),
  runUpdateMany: vi.fn(),
  publicationFindMany: vi.fn(),
  publicationUpdateMany: vi.fn(),
  editorialEventCreate: vi.fn(),
  loadLockedHomePlacements: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: transaction,
  },
}));

vi.mock("./loadLockedHomePlacements", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("./loadLockedHomePlacements")>();

  return {
    ...original,
    loadLockedHomePlacements,
  };
});

import type { Prisma } from "@/lib/generated/prisma/client";

import {
  rollbackAutomatedHomeComposition,
  readHomeCompositionRollbackRuntime,
} from "./rollbackAutomatedHomeComposition";
import {
  serializeHomeAutomationSnapshot,
  type HomeAutomationSnapshot,
} from "./homeAutomationSnapshot";
import type { LockedHomePublication } from "./loadLockedHomePlacements";

const appliedAt = new Date("2026-09-05T08:00:00.000Z");
const snapshotUpdatedAt = new Date("2026-09-05T07:00:00.000Z");

const actor = {
  id: "admin-1",
  email: "admin@example.com",
};

function makeLockedPlacement(): LockedHomePublication {
  return {
    publicationId: 10,
    priority: 20,
    startsAt: null,
    endsAt: null,
    updatedAt: snapshotUpdatedAt,
    zone: "hero",
    articleId: 42,
    title: "Choix humain",
    category: "ACTUALITÉ",
    sourceId: null,
    sourceName: "Rédaction",
  };
}

function makeSnapshot(): HomeAutomationSnapshot {
  return {
    lockedPlacements: [makeLockedPlacement()],
    publications: [
      {
        publicationId: 11,
        articleId: 43,
        channel: "site",
        pageKey: "home",
        zone: "card",
        priority: 10,
        startsAt: null,
        endsAt: null,
        active: true,
        origin: "AUTOMATED",
        locked: false,
        automationScore: 75,
        automationPolicyVersion: "1.0",
        automationRunId: null,
        updatedAt: snapshotUpdatedAt,
      },
    ],
  };
}

const transactionClient = {
  homeAutomationRun: {
    findUnique: runFindUnique,
    updateMany: runUpdateMany,
  },
  publication: {
    findMany: publicationFindMany,
    updateMany: publicationUpdateMany,
  },
  editorialEvent: {
    create: editorialEventCreate,
  },
} as unknown as Prisma.TransactionClient;

describe("retour arrière d’une composition automatique", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.stubEnv("AI_HOME_COMPOSITION_ROLLBACK_ENABLED", "true");
    vi.stubEnv("AI_HOME_COMPOSITION_EMERGENCY_STOP", "false");
    vi.stubEnv("AI_AUTO_PUBLICATION_EMERGENCY_STOP", "false");

    transaction.mockImplementation(
      async (
        callback: (client: Prisma.TransactionClient) => Promise<unknown>,
      ) => callback(transactionClient),
    );

    runFindUnique.mockResolvedValue({
      id: "run-123",
      policyVersion: "1.1",
      status: "APPLIED",
      snapshot: serializeHomeAutomationSnapshot(makeSnapshot()),
      appliedAt,
    });

    loadLockedHomePlacements.mockResolvedValue([makeLockedPlacement()]);

    publicationFindMany.mockResolvedValue([
      {
        id: 100,
        active: true,
        locked: false,
        origin: "AUTOMATED",
      },
      {
        id: 101,
        active: true,
        locked: false,
        origin: "FALLBACK",
      },
    ]);

    publicationUpdateMany
      .mockResolvedValueOnce({
        count: 2,
      })
      .mockResolvedValueOnce({
        count: 1,
      });

    editorialEventCreate.mockResolvedValue({
      id: 1,
    });

    runUpdateMany.mockResolvedValue({
      count: 1,
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("est désactivé par défaut", () => {
    expect(readHomeCompositionRollbackRuntime({})).toEqual({
      enabled: false,
      emergencyStop: false,
    });
  });

  it("n’ouvre aucune transaction lorsque le retour arrière est désactivé", async () => {
    vi.stubEnv("AI_HOME_COMPOSITION_ROLLBACK_ENABLED", "false");

    await expect(
      rollbackAutomatedHomeComposition({
        runId: "run-123",
        actor,
      }),
    ).rejects.toThrow("Retour arrière de la composition désactivé.");

    expect(transaction).not.toHaveBeenCalled();
  });

  it("donne la priorité à l’arrêt d’urgence", async () => {
    vi.stubEnv("AI_HOME_COMPOSITION_EMERGENCY_STOP", "true");

    await expect(
      rollbackAutomatedHomeComposition({
        runId: "run-123",
        actor,
      }),
    ).rejects.toThrow("Retour arrière bloqué : arrêt d’urgence actif.");

    expect(transaction).not.toHaveBeenCalled();
  });

  it("refuse un identifiant vide avant la transaction", async () => {
    await expect(
      rollbackAutomatedHomeComposition({
        runId: " ",
        actor,
      }),
    ).rejects.toThrow("L’identifiant du run est obligatoire.");

    expect(transaction).not.toHaveBeenCalled();
  });

  it("refuse un run introuvable", async () => {
    runFindUnique.mockResolvedValue(null);

    await expect(
      rollbackAutomatedHomeComposition({
        runId: "run-inconnu",
        actor,
      }),
    ).rejects.toThrow("Le run run-inconnu est introuvable.");

    expect(publicationFindMany).not.toHaveBeenCalled();
  });

  it("refuse un run qui n’est pas appliqué", async () => {
    runFindUnique.mockResolvedValue({
      id: "run-123",
      policyVersion: "1.1",
      status: "ROLLED_BACK",
      snapshot: serializeHomeAutomationSnapshot(makeSnapshot()),
      appliedAt,
    });

    await expect(
      rollbackAutomatedHomeComposition({
        runId: "run-123",
        actor,
      }),
    ).rejects.toThrow("ne peut pas être annulé depuis l’état ROLLED_BACK");

    expect(publicationFindMany).not.toHaveBeenCalled();
  });

  it("refuse si un choix humain a changé", async () => {
    loadLockedHomePlacements.mockResolvedValue([
      {
        ...makeLockedPlacement(),
        priority: 30,
      },
    ]);

    await expect(
      rollbackAutomatedHomeComposition({
        runId: "run-123",
        actor,
      }),
    ).rejects.toThrow("Les sélections humaines ont changé");

    expect(publicationFindMany).not.toHaveBeenCalled();
    expect(publicationUpdateMany).not.toHaveBeenCalled();
    expect(runUpdateMany).not.toHaveBeenCalled();
  });

  it("ne désactive jamais une publication devenue humaine", async () => {
    publicationFindMany.mockResolvedValue([
      {
        id: 100,
        active: true,
        locked: true,
        origin: "MANUAL",
      },
    ]);

    await expect(
      rollbackAutomatedHomeComposition({
        runId: "run-123",
        actor,
      }),
    ).rejects.toThrow("La publication 100 est devenue humaine");

    expect(publicationUpdateMany).not.toHaveBeenCalled();
    expect(runUpdateMany).not.toHaveBeenCalled();
  });

  it("désactive le run, restaure le snapshot et trace l’opération", async () => {
    const result = await rollbackAutomatedHomeComposition({
      runId: "run-123",
      actor,
    });

    expect(result).toEqual({
      runId: "run-123",
      disabledPublicationIds: [100, 101],
      restoredPublicationIds: [11],
      preservedLockedPublicationIds: [10],
      rolledBackAt: expect.any(String),
    });

    expect(publicationUpdateMany).toHaveBeenNthCalledWith(1, {
      where: {
        id: {
          in: [100, 101],
        },
        automationRunId: "run-123",
        active: true,
        locked: false,
        origin: {
          in: ["AUTOMATED", "FALLBACK"],
        },
      },
      data: {
        active: false,
        endsAt: expect.any(Date),
      },
    });

    expect(publicationUpdateMany).toHaveBeenNthCalledWith(2, {
      where: {
        id: 11,
        articleId: 43,
        pageKey: "home",
        channel: "site",
        active: false,
        locked: false,
        origin: "AUTOMATED",
        endsAt: appliedAt,
      },
      data: {
        channel: "site",
        pageKey: "home",
        zone: "card",
        priority: 10,
        startsAt: null,
        endsAt: null,
        active: true,
        origin: "AUTOMATED",
        locked: false,
        automationScore: 75,
        automationPolicyVersion: "1.0",
        automationRunId: null,
      },
    });

    expect(editorialEventCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "HOME_COMPOSITION_ROLLED_BACK",
        articleId: undefined,
        actorId: "admin-1",
        actorEmail: "admin@example.com",
        details: expect.any(String),
      }),
    });

    const eventDetails = JSON.parse(
      editorialEventCreate.mock.calls[0][0].data.details,
    );

    expect(eventDetails).toEqual({
      policyVersion: "1.1",
      ...result,
    });

    expect(runUpdateMany).toHaveBeenCalledWith({
      where: {
        id: "run-123",
        status: "APPLIED",
      },
      data: {
        status: "ROLLED_BACK",
        rolledBackAt: expect.any(Date),
      },
    });
  });

  it("refuse une modification concurrente pendant la restauration", async () => {
    publicationUpdateMany
      .mockReset()
      .mockResolvedValueOnce({
        count: 2,
      })
      .mockResolvedValueOnce({
        count: 0,
      });

    await expect(
      rollbackAutomatedHomeComposition({
        runId: "run-123",
        actor,
      }),
    ).rejects.toThrow(
      "La publication 11 ne peut pas être restaurée sans risque.",
    );

    expect(editorialEventCreate).not.toHaveBeenCalled();
    expect(runUpdateMany).not.toHaveBeenCalled();
  });

  it("finalise le run après l’écriture de l’historique", async () => {
    await rollbackAutomatedHomeComposition({
      runId: "run-123",
      actor,
    });

    expect(editorialEventCreate.mock.invocationCallOrder[0]).toBeLessThan(
      runUpdateMany.mock.invocationCallOrder[0],
    );
  });
});
