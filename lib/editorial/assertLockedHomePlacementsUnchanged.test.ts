import { describe, expect, it } from "vitest";

import {
  assertLockedHomePlacementsUnchanged,
  LockedHomePlacementsChangedError,
} from "./assertLockedHomePlacementsUnchanged";
import type { LockedHomePublication } from "./loadLockedHomePlacements";

function makePlacement(
  overrides: Partial<LockedHomePublication> = {},
): LockedHomePublication {
  return {
    publicationId: 10,
    priority: 20,
    startsAt: null,
    endsAt: null,
    updatedAt: new Date("2026-09-03T08:00:00.000Z"),
    articleId: 42,
    zone: "hero",
    title: "Article humain",
    category: "ACTUALITÉ",
    sourceId: 5,
    sourceName: "Source humaine",
    ...overrides,
  };
}

describe("comparaison des sélections humaines", () => {
  it("accepte deux listes vides", () => {
    expect(() => assertLockedHomePlacementsUnchanged([], [])).not.toThrow();
  });

  it("accepte des sélections identiques", () => {
    expect(() =>
      assertLockedHomePlacementsUnchanged([makePlacement()], [makePlacement()]),
    ).not.toThrow();
  });

  it("compare les dates par leur valeur et non par leur référence", () => {
    const simulated = makePlacement({
      startsAt: new Date("2026-09-03T07:00:00.000Z"),
      endsAt: new Date("2026-09-04T07:00:00.000Z"),
    });

    const current = makePlacement({
      startsAt: new Date("2026-09-03T07:00:00.000Z"),
      endsAt: new Date("2026-09-04T07:00:00.000Z"),
    });

    expect(() =>
      assertLockedHomePlacementsUnchanged([simulated], [current]),
    ).not.toThrow();
  });

  it("ignore l’ordre de réception et ne modifie pas les listes", () => {
    const hero = makePlacement();
    const card = makePlacement({
      publicationId: 11,
      articleId: 43,
      zone: "card",
    });

    const simulated = [hero, card];
    const current = [card, hero];

    expect(() =>
      assertLockedHomePlacementsUnchanged(simulated, current),
    ).not.toThrow();

    expect(simulated).toEqual([hero, card]);
    expect(current).toEqual([card, hero]);
  });

  it("refuse l’ajout d’une sélection humaine", () => {
    expect(() =>
      assertLockedHomePlacementsUnchanged([], [makePlacement()]),
    ).toThrow(LockedHomePlacementsChangedError);
  });

  it("refuse le retrait d’une sélection humaine", () => {
    expect(() =>
      assertLockedHomePlacementsUnchanged([makePlacement()], []),
    ).toThrow(LockedHomePlacementsChangedError);
  });

  it.each([
    { label: "publication", change: { publicationId: 99 } },
    { label: "article", change: { articleId: 99 } },
    { label: "zone", change: { zone: "card" as const } },
    { label: "catégorie", change: { category: "POLITIQUE" } },
    { label: "source", change: { sourceId: 99 } },
    { label: "source devenue inconnue", change: { sourceId: null } },
    { label: "priorité", change: { priority: 30 } },
    {
      label: "début de programmation",
      change: {
        startsAt: new Date("2026-09-03T09:00:00.000Z"),
      },
    },
    {
      label: "fin de programmation",
      change: {
        endsAt: new Date("2026-09-04T09:00:00.000Z"),
      },
    },
    {
      label: "date de modification",
      change: {
        updatedAt: new Date("2026-09-03T09:00:00.000Z"),
      },
    },
  ])("refuse un changement de $label", ({ change }) => {
    expect(() =>
      assertLockedHomePlacementsUnchanged(
        [makePlacement()],
        [makePlacement(change)],
      ),
    ).toThrow(LockedHomePlacementsChangedError);
  });

  it("refuse la suppression d’une date de programmation", () => {
    expect(() =>
      assertLockedHomePlacementsUnchanged(
        [
          makePlacement({
            startsAt: new Date("2026-09-03T07:00:00.000Z"),
          }),
        ],
        [makePlacement({ startsAt: null })],
      ),
    ).toThrow(LockedHomePlacementsChangedError);
  });

  it("ne confond pas un changement de libellé avec un déplacement", () => {
    expect(() =>
      assertLockedHomePlacementsUnchanged(
        [makePlacement()],
        [
          makePlacement({
            title: "Titre corrigé",
            sourceName: "Nom corrigé",
          }),
        ],
      ),
    ).not.toThrow();
  });
});
