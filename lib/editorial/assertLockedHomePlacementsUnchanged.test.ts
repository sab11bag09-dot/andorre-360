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
  ])("refuse un changement de $label", ({ change }) => {
    expect(() =>
      assertLockedHomePlacementsUnchanged(
        [makePlacement()],
        [makePlacement(change)],
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
