import { describe, expect, it } from "vitest";

import { normalizeEditorialCategory } from "./normalizeEditorialCategory";

describe("normalizeEditorialCategory", () => {
  it.each([
    [" Actualité ", "ACTUALITÉ"],
    ["ECONOMIE", "ÉCONOMIE"],
    ["économie", "ÉCONOMIE"],
    ["Société", "SOCIÉTÉ"],
    ["sports", "SPORTS"],
    ["Ils en parlent", "ILS_EN_PARLENT"],
    ["ils_en_parlent", "ILS_EN_PARLENT"],
    ["lifestyle", "LOISIRS"],
    ["PRESSE", "ACTUALITÉ"],
    ["Général", "ACTUALITÉ"],
    ["Éditorial", "ÉDITORIAL"],
  ])(
    "normalise %s vers %s",
    (input, expected) => {
      expect(normalizeEditorialCategory(input)).toBe(expected);
    },
  );

  it.each([
    null,
    undefined,
    "",
    "catégorie inventée",
    "IMMOBILIER",
  ])(
    "utilise ACTUALITÉ pour une valeur absente ou inconnue",
    (input) => {
      expect(normalizeEditorialCategory(input)).toBe(
        "ACTUALITÉ",
      );
    },
  );
});
