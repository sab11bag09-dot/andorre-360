import { beforeEach, describe, expect, it, vi } from "vitest";

const { update } = vi.hoisted(() => ({ update: vi.fn() }));

vi.mock("@/lib/prisma", () => ({
  prisma: { source: { update } },
}));

import {
  EMPTY_COLLECTION_ALERT_THRESHOLD,
  PrismaCollectionSourceRepository,
} from "./PrismaCollectionSourceRepository";

const checkedAt = new Date("2026-11-21T12:00:00.000Z");

describe("PrismaCollectionSourceRepository", () => {
  beforeEach(() => {
    update.mockReset();
    vi.restoreAllMocks();
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  it("n’efface pas le compteur de collectes vides et alerte au seuil", async () => {
    update.mockResolvedValueOnce({
      name: "FAE",
      consecutiveEmptyCollections: EMPTY_COLLECTION_ALERT_THRESHOLD,
    });

    await new PrismaCollectionSourceRepository().markCollectionEmpty(
      57,
      checkedAt,
    );

    expect(update.mock.calls[0][0].data).toMatchObject({
      consecutiveEmptyCollections: { increment: 1 },
      lastSuccessAt: checkedAt,
    });
    expect(update.mock.calls[1][0]).toEqual({
      where: { id: 57 },
      data: {
        lastErrorMessage:
          "Alerte : FAE a retourné 0 observation lors de 3 collectes consécutives.",
      },
    });
    expect(console.warn).toHaveBeenCalledOnce();
  });

  it("ne signale rien sous le seuil de collectes vides", async () => {
    update.mockResolvedValueOnce({
      name: "FAE",
      consecutiveEmptyCollections: 1,
    });

    await new PrismaCollectionSourceRepository().markCollectionEmpty(
      57,
      checkedAt,
    );

    expect(update.mock.calls[1][0].data).toEqual({ lastErrorMessage: null });
    expect(console.warn).not.toHaveBeenCalled();
  });

  it("signale une collecte réussie qui ne renvoie aucune date", async () => {
    update.mockResolvedValueOnce({ name: "Agenda.ad" });

    await new PrismaCollectionSourceRepository().markCollectionSucceeded(
      46,
      checkedAt,
      { total: 12, dated: 0, undated: 12, futureRejected: 0 },
    );

    expect(update.mock.calls[0][0].data).toMatchObject({
      availabilityStatus: "AVAILABLE",
      lastErrorMessage: null,
      consecutiveEmptyCollections: 0,
    });
    expect(update.mock.calls[1][0].data.lastErrorMessage).toBe(
      "Alerte : Agenda.ad n’a renvoyé aucune date de publication sur 12 observations.",
    );
    expect(console.warn).toHaveBeenCalledOnce();
  });

  it("efface l’alerte dès qu’une collecte retrouve des dates", async () => {
    update.mockResolvedValueOnce({ name: "Bondia" });

    await new PrismaCollectionSourceRepository().markCollectionSucceeded(
      7,
      checkedAt,
      { total: 10, dated: 8, undated: 2, futureRejected: 0 },
    );

    expect(update).toHaveBeenCalledOnce();
    expect(update.mock.calls[0][0].data.lastErrorMessage).toBeNull();
  });

  it("journalise les dates futures refusées", async () => {
    update.mockResolvedValueOnce({ name: "Altaveu" });

    await new PrismaCollectionSourceRepository().markCollectionSucceeded(
      4,
      checkedAt,
      { total: 10, dated: 6, undated: 4, futureRejected: 4 },
    );

    expect(console.warn).toHaveBeenCalledWith(
      "[SourceCollectionAlert]",
      expect.stringContaining("\"futureRejected\":4"),
    );
  });
});
