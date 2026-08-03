import { describe, expect, it, vi } from "vitest";

import { collectDueSources } from "./collectDueSources";
import type {
  ScheduledSource,
  ScheduledSourceRepository,
} from "./repositories/ScheduledSourceRepository";

class FakeScheduledSourceRepository
  implements ScheduledSourceRepository
{
  public claimedIds: number[] = [];

  constructor(
    private readonly sources: ScheduledSource[],
    private readonly rejectedClaims = new Set<number>(),
  ) {}

  async findActive(): Promise<ScheduledSource[]> {
    return this.sources;
  }

  async claim(source: ScheduledSource): Promise<boolean> {
    this.claimedIds.push(source.id);

    return !this.rejectedClaims.has(source.id);
  }
}

const now = new Date("2026-08-03T12:00:00.000Z");

describe("collectDueSources", () => {
  it("ne collecte que les sources arrivées à échéance", async () => {
    const repository = new FakeScheduledSourceRepository([
      { id: 1, checkIntervalMinutes: 15, lastCheckedAt: null },
      {
        id: 2,
        checkIntervalMinutes: 15,
        lastCheckedAt: new Date("2026-08-03T11:44:00.000Z"),
      },
      {
        id: 3,
        checkIntervalMinutes: 15,
        lastCheckedAt: new Date("2026-08-03T11:50:00.000Z"),
      },
    ]);
    const collectOne = vi
      .fn()
      .mockResolvedValue({ collected: 2, created: 1 });

    const result = await collectDueSources(
      { now, batchSize: 10 },
      repository,
      collectOne,
    );

    expect(collectOne.mock.calls).toEqual([[1], [2]]);
    expect(repository.claimedIds).toEqual([1, 2]);
    expect(result).toEqual({
      attempted: 2,
      succeeded: 2,
      failed: 0,
      collected: 4,
      created: 2,
      failures: [],
    });
  });

  it("respecte la taille du lot et ignore une source déjà réclamée", async () => {
    const repository = new FakeScheduledSourceRepository(
      [1, 2, 3].map((id) => ({
        id,
        checkIntervalMinutes: 15,
        lastCheckedAt: null,
      })),
      new Set([1]),
    );
    const collectOne = vi
      .fn()
      .mockResolvedValue({ collected: 1, created: 1 });

    const result = await collectDueSources(
      { now, batchSize: 1 },
      repository,
      collectOne,
    );

    expect(repository.claimedIds).toEqual([1, 2]);
    expect(collectOne).toHaveBeenCalledOnce();
    expect(collectOne).toHaveBeenCalledWith(2);
    expect(result.attempted).toBe(1);
  });

  it("isole l’échec d’une source et poursuit le lot", async () => {
    const repository = new FakeScheduledSourceRepository(
      [1, 2].map((id) => ({
        id,
        checkIntervalMinutes: 15,
        lastCheckedAt: null,
      })),
    );
    const collectOne = vi
      .fn()
      .mockRejectedValueOnce(new Error("Flux indisponible"))
      .mockResolvedValueOnce({ collected: 3, created: 2 });

    const result = await collectDueSources(
      { now },
      repository,
      collectOne,
    );

    expect(collectOne.mock.calls).toEqual([[1], [2]]);
    expect(result).toEqual({
      attempted: 2,
      succeeded: 1,
      failed: 1,
      collected: 3,
      created: 2,
      failures: [
        { sourceId: 1, message: "Flux indisponible" },
      ],
    });
  });
});
