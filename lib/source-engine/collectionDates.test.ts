import { describe, expect, it } from "vitest";

import {
  getUndatedCollectionAlert,
  summarizeCollectionDates,
} from "./collectionDates";
import { assessObservationPublishedAt } from "./observationDate";

const now = new Date("2026-11-21T12:00:00.000Z");

function observation(publishedAt: Date | null) {
  return {
    title: "Titre",
    url: `https://example.com/${Math.random()}`,
    publishedAt,
    content: null,
  };
}

describe("assessObservationPublishedAt", () => {
  it("distingue date absente, illisible, future et retenue", () => {
    expect(assessObservationPublishedAt(null, now)).toEqual({
      publishedAt: null,
      issue: "missing",
    });
    expect(assessObservationPublishedAt(new Date("nope"), now).issue).toBe(
      "invalid",
    );
    expect(
      assessObservationPublishedAt(new Date("2026-12-07T23:00:00.000Z"), now),
    ).toEqual({ publishedAt: null, issue: "future" });

    const date = new Date("2026-11-20T08:00:00.000Z");
    expect(assessObservationPublishedAt(date, now)).toEqual({
      publishedAt: date,
      issue: null,
    });
  });

  it("tolère un jour d’avance (décalage horaire du site)", () => {
    expect(
      assessObservationPublishedAt(new Date("2026-11-22T11:00:00.000Z"), now)
        .issue,
    ).toBeNull();
  });
});

describe("summarizeCollectionDates", () => {
  it("compte les dates retenues, manquantes et futures", () => {
    expect(
      summarizeCollectionDates(
        [
          observation(new Date("2026-11-20T08:00:00.000Z")),
          observation(null),
          observation(new Date("2999-01-01T00:00:00.000Z")),
        ],
        now,
      ),
    ).toEqual({ total: 3, dated: 1, undated: 2, futureRejected: 1 });
  });
});

describe("getUndatedCollectionAlert", () => {
  it("alerte quand une collecte ne renvoie aucune date", () => {
    expect(
      getUndatedCollectionAlert("Agenda.ad", {
        total: 12,
        dated: 0,
        undated: 12,
        futureRejected: 2,
      }),
    ).toBe(
      "Alerte : Agenda.ad n’a renvoyé aucune date de publication sur 12 observations (2 dates futures refusées).",
    );
  });

  it("n’alerte pas si au moins une date est lue ou si la collecte est vide", () => {
    expect(
      getUndatedCollectionAlert("Bondia", {
        total: 5,
        dated: 1,
        undated: 4,
        futureRejected: 0,
      }),
    ).toBeNull();
    expect(
      getUndatedCollectionAlert("Bondia", {
        total: 0,
        dated: 0,
        undated: 0,
        futureRejected: 0,
      }),
    ).toBeNull();
  });
});
