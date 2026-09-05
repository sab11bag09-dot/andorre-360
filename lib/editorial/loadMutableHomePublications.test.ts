import { beforeEach, describe, expect, it, vi } from "vitest";

const { findMany } = vi.hoisted(() => ({
  findMany: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    publication: {
      findMany,
    },
  },
}));

import { loadMutableHomePublications } from "./loadMutableHomePublications";

describe("loadMutableHomePublications", () => {
  beforeEach(() => {
    findMany.mockReset();
    findMany.mockResolvedValue([]);
  });

  it("charge uniquement les publications automatiques actives et modifiables", async () => {
    await loadMutableHomePublications();

    expect(findMany).toHaveBeenCalledWith({
      where: {
        pageKey: "home",
        channel: "site",
        active: true,
        locked: false,
        origin: {
          in: ["AUTOMATED", "FALLBACK"],
        },
        zone: {
          in: ["hero", "feature", "grand-format", "card", "brief"],
        },
      },
      select: {
        id: true,
        articleId: true,
        channel: true,
        pageKey: true,
        zone: true,
        priority: true,
        startsAt: true,
        endsAt: true,
        active: true,
        origin: true,
        locked: true,
        automationScore: true,
        automationPolicyVersion: true,
        automationRunId: true,
        updatedAt: true,
      },
      orderBy: {
        id: "asc",
      },
    });
  });

  it("utilise le client transactionnel fourni", async () => {
    const updatedAt = new Date("2026-09-05T08:00:00.000Z");
    const transactionFindMany = vi.fn().mockResolvedValue([
      {
        id: 12,
        articleId: 42,
        channel: "site",
        pageKey: "home",
        zone: "card",
        priority: 20,
        startsAt: null,
        endsAt: null,
        active: true,
        origin: "AUTOMATED",
        locked: false,
        automationScore: 90,
        automationPolicyVersion: "1.1",
        automationRunId: "ancien-run",
        updatedAt,
      },
    ]);

    const client = {
      publication: {
        findMany: transactionFindMany,
      },
    } as unknown as NonNullable<
      Parameters<typeof loadMutableHomePublications>[0]
    >;

    await expect(loadMutableHomePublications(client)).resolves.toEqual([
      {
        publicationId: 12,
        articleId: 42,
        channel: "site",
        pageKey: "home",
        zone: "card",
        priority: 20,
        startsAt: null,
        endsAt: null,
        active: true,
        origin: "AUTOMATED",
        locked: false,
        automationScore: 90,
        automationPolicyVersion: "1.1",
        automationRunId: "ancien-run",
        updatedAt,
      },
    ]);

    expect(transactionFindMany).toHaveBeenCalledTimes(1);
    expect(findMany).not.toHaveBeenCalled();
  });
});
