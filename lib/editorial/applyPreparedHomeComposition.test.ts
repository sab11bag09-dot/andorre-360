import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Prisma, PrismaClient } from "@/lib/generated/prisma/client";

import type { HomeCompositionResult } from "./homeComposition";
import type { LockedHomePublication } from "./loadLockedHomePlacements";
import type { MutableHomePublicationSnapshot } from "./loadMutableHomePublications";
import type { HomeAutomationTransactionWork } from "./withHomeAutomationTransaction";
import type { WriteAutomatedHomeCompositionResult } from "./writeAutomatedHomeComposition";

const { withHomeAutomationTransaction, writeAutomatedHomeComposition } =
  vi.hoisted(() => ({
    withHomeAutomationTransaction: vi.fn(),
    writeAutomatedHomeComposition: vi.fn(),
  }));

vi.mock("./withHomeAutomationTransaction", () => ({
  withHomeAutomationTransaction,
}));

vi.mock("./writeAutomatedHomeComposition", () => ({
  writeAutomatedHomeComposition,
}));

import { applyPreparedHomeComposition } from "./applyPreparedHomeComposition";

const appliedAt = new Date("2026-09-05T10:00:00.000Z");

function makeLockedPlacement(): LockedHomePublication {
  return {
    publicationId: 10,
    articleId: 1,
    zone: "hero",
    priority: 20,
    startsAt: null,
    endsAt: null,
    updatedAt: new Date("2026-09-05T08:00:00.000Z"),
    title: "Article humain",
    category: "POLITIQUE",
    sourceId: 2,
    sourceName: "Source humaine",
  };
}

function makeMutablePublication(): MutableHomePublicationSnapshot {
  return {
    publicationId: 20,
    articleId: 30,
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
    automationRunId: "ancien-run",
    updatedAt: new Date("2026-09-04T10:00:00.000Z"),
  };
}

function makeComposition(): HomeCompositionResult {
  return {
    placements: [
      {
        zone: "hero",
        articleId: 1,
        sourceId: 2,
        category: "POLITIQUE",
        score: 0,
        origin: "LOCKED",
      },
      {
        zone: "card",
        articleId: 42,
        sourceId: 5,
        category: "ACTUALITÉ",
        score: 90,
        origin: "AUTOMATED",
      },
    ],
    evaluations: [],
    unfilledSlots: {
      hero: 0,
      feature: 1,
      "grand-format": 1,
      card: 3,
      brief: 3,
    },
  };
}

describe("applyPreparedHomeComposition", () => {
  const transaction = {} as Prisma.TransactionClient;
  const lockedPlacements = [makeLockedPlacement()];
  const mutablePublications = [makeMutablePublication()];

  const result: WriteAutomatedHomeCompositionResult = {
    createdPublicationIds: [100],
    disabledPublicationIds: [20],
    preservedLockedPublicationIds: [10],
    placements: [
      {
        publicationId: 100,
        articleId: 42,
        zone: "card",
        score: 90,
        origin: "AUTOMATED",
      },
    ],
  };

  beforeEach(() => {
    vi.resetAllMocks();

    writeAutomatedHomeComposition.mockResolvedValue(result);

    withHomeAutomationTransaction.mockImplementation(
      async (
        _input: unknown,
        work: HomeAutomationTransactionWork<WriteAutomatedHomeCompositionResult>,
      ) => work(transaction, lockedPlacements, mutablePublications, appliedAt),
    );
  });

  it("transmet la composition au moteur dans la transaction", async () => {
    const composition = makeComposition();

    await expect(
      applyPreparedHomeComposition({
        runId: "run-123",
        policyVersion: "1.1",
        actor: {
          id: "admin-1",
          email: "admin@example.com",
        },
        composition,
        lockedPlacements,
      }),
    ).resolves.toEqual(result);

    expect(withHomeAutomationTransaction).toHaveBeenCalledWith(
      {
        runId: "run-123",
        policyVersion: "1.1",
        actor: {
          id: "admin-1",
          email: "admin@example.com",
        },
        simulatedLockedPlacements: lockedPlacements,
      },
      expect.any(Function),
    );

    expect(writeAutomatedHomeComposition).toHaveBeenCalledExactlyOnceWith(
      transaction,
      {
        runId: "run-123",
        policyVersion: "1.1",
        appliedAt,
        placements: composition.placements,
        lockedPlacements,
        mutablePublications,
      },
    );
  });

  it("transmet le client Prisma injecté", async () => {
    const client = {
      $transaction: vi.fn(),
    } as unknown as Pick<PrismaClient, "$transaction">;

    await applyPreparedHomeComposition(
      {
        runId: "run-client",
        policyVersion: "1.1",
        actor: {
          id: "admin-1",
          email: "admin@example.com",
        },
        composition: makeComposition(),
        lockedPlacements,
      },
      client,
    );

    expect(withHomeAutomationTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        runId: "run-client",
      }),
      expect.any(Function),
      client,
    );
  });
});
