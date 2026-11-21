import { describe, expect, it, vi } from "vitest";

import {
  getSourceCollectionIssues,
  loadRecentDateStats,
} from "./collectionHealth";

const healthy = {
  active: true,
  availabilityStatus: "AVAILABLE" as const,
  lastErrorAt: null,
  lastSuccessAt: new Date("2026-11-19T12:00:00.000Z"),
  lastErrorMessage: null,
};

describe("getSourceCollectionIssues", () => {
  it("ne signale rien pour une source saine", () => {
    expect(
      getSourceCollectionIssues(healthy, { total: 10, undated: 1 }),
    ).toEqual([]);
  });

  it("signale une source indisponible avec son message d’erreur", () => {
    expect(
      getSourceCollectionIssues(
        {
          ...healthy,
          availabilityStatus: "UNAVAILABLE",
          lastErrorAt: new Date("2026-11-19T12:16:45.000Z"),
          lastErrorMessage:
            "Impossible de récupérer https://www.comuencamp.ad/actualitat/noticies (403).",
        },
        undefined,
      ),
    ).toEqual([
      {
        kind: "error",
        label: "En erreur",
        detail:
          "Impossible de récupérer https://www.comuencamp.ad/actualitat/noticies (403).",
      },
    ]);
  });

  it("signale une erreur plus récente que le dernier succès", () => {
    const [issue] = getSourceCollectionIssues(
      {
        ...healthy,
        lastErrorAt: new Date("2026-11-20T08:00:00.000Z"),
        lastErrorMessage: "Délai dépassé",
      },
      undefined,
    );

    expect(issue.kind).toBe("error");
  });

  it("relaie l’alerte posée par une collecte réussie", () => {
    const message =
      "Alerte : Agenda.ad n’a renvoyé aucune date de publication sur 12 observations.";

    expect(
      getSourceCollectionIssues(
        { ...healthy, lastErrorMessage: message },
        undefined,
      ),
    ).toEqual([{ kind: "alert", label: "Alerte de collecte", detail: message }]);
  });

  it("signale une source dont la majorité des observations récentes n’a pas de date", () => {
    expect(
      getSourceCollectionIssues(healthy, { total: 24, undated: 24 }),
    ).toEqual([
      {
        kind: "undated",
        label: "Sans date : 24/24",
        detail:
          "24 observations sur 24 collectées en 14 jours n’ont pas de date de publication.",
      },
    ]);
  });

  it("ignore un volume trop faible et les sources désactivées", () => {
    expect(
      getSourceCollectionIssues(healthy, { total: 2, undated: 2 }),
    ).toEqual([]);
    expect(
      getSourceCollectionIssues(
        { ...healthy, active: false, availabilityStatus: "UNAVAILABLE" },
        { total: 10, undated: 10 },
      ),
    ).toEqual([]);
  });
});

describe("loadRecentDateStats", () => {
  it("assemble le total et la part sans date par source sur 14 jours", async () => {
    const groupBy = vi
      .fn()
      .mockResolvedValueOnce([
        { sourceId: 7, _count: { _all: 10 } },
        { sourceId: 46, _count: { _all: 12 } },
      ])
      .mockResolvedValueOnce([{ sourceId: 46, _count: { _all: 12 } }]);

    const stats = await loadRecentDateStats(
      { observation: { groupBy } } as never,
      new Date("2026-11-21T12:00:00.000Z"),
    );

    expect(groupBy.mock.calls[0][0].where).toEqual({
      collectedAt: { gte: new Date("2026-11-07T12:00:00.000Z") },
    });
    expect(groupBy.mock.calls[1][0].where).toEqual({
      collectedAt: { gte: new Date("2026-11-07T12:00:00.000Z") },
      publishedAt: null,
    });
    expect(stats.get(7)).toEqual({ total: 10, undated: 0 });
    expect(stats.get(46)).toEqual({ total: 12, undated: 12 });
  });
});
