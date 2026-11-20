import { describe, expect, it } from "vitest";

import { allocateRubricSlots } from "./allocateRubricSlots";

const items = Array.from({ length: 20 }, (_, index) => ({ id: index + 1 }));

describe("allocateRubricSlots", () => {
  it("répartit les articles dans l’ordre du plan, sans en sauter aucun", () => {
    const slots = allocateRubricSlots(items, {
      hero: 1,
      main: 1,
      question: 1,
      side: 3,
      briefs: 6,
      middle: 2,
      bottom: 2,
      goodToKnow: 1,
    });

    expect(slots.hero.map(({ id }) => id)).toEqual([1]);
    expect(slots.main.map(({ id }) => id)).toEqual([2]);
    expect(slots.question.map(({ id }) => id)).toEqual([3]);
    expect(slots.side.map(({ id }) => id)).toEqual([4, 5, 6]);
    expect(slots.briefs.map(({ id }) => id)).toEqual([7, 8, 9, 10, 11, 12]);
    expect(slots.middle.map(({ id }) => id)).toEqual([13, 14]);
    expect(slots.bottom.map(({ id }) => id)).toEqual([15, 16]);
    expect(slots.goodToKnow.map(({ id }) => id)).toEqual([17]);
  });

  it("laisse vides les derniers emplacements quand les articles manquent", () => {
    const slots = allocateRubricSlots(items.slice(0, 4), {
      hero: 1,
      side: 2,
      briefs: 3,
    });

    expect(slots.hero.map(({ id }) => id)).toEqual([1]);
    expect(slots.side.map(({ id }) => id)).toEqual([2, 3]);
    expect(slots.briefs.map(({ id }) => id)).toEqual([4]);
  });

  it("refuse un nombre d’emplacements invalide", () => {
    expect(() => allocateRubricSlots(items, { hero: 0 })).toThrow(
      "Le nombre d’emplacements de « hero » doit être un entier positif.",
    );
  });
});
