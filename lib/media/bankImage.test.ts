import { describe, expect, it } from "vitest";

import {
  ALL_RUBRICS,
  chooseBankImage,
  parseBankCategory,
  type BankImageCandidate,
} from "./bankImage";

function candidate(overrides: Partial<BankImageCandidate> & { id: number }): BankImageCandidate {
  return {
    path: `/api/media/files/originals/${overrides.id}.jpg`,
    bankCategory: "SPORTS",
    usageCount: 0,
    lastUsedAt: null,
    ...overrides,
  };
}

describe("chooseBankImage", () => {
  it("préfère une image de la rubrique de l’article à une image valable pour toutes", () => {
    expect(
      chooseBankImage(
        [candidate({ id: 1, bankCategory: ALL_RUBRICS }), candidate({ id: 2, usageCount: 5 })],
        "SPORTS",
      )?.id,
    ).toBe(2);
  });

  it("se rabat sur une image valable pour toutes les rubriques", () => {
    expect(
      chooseBankImage(
        [candidate({ id: 1, bankCategory: "CULTURE" }), candidate({ id: 2, bankCategory: ALL_RUBRICS })],
        "SPORTS",
      )?.id,
    ).toBe(2);
  });

  it("varie les images : la moins utilisée d’abord, puis la plus anciennement utilisée", () => {
    expect(
      chooseBankImage([candidate({ id: 1, usageCount: 3 }), candidate({ id: 2, usageCount: 1 })], "SPORTS")?.id,
    ).toBe(2);
    expect(
      chooseBankImage(
        [
          candidate({ id: 1, usageCount: 2, lastUsedAt: new Date("2026-11-19") }),
          candidate({ id: 2, usageCount: 2, lastUsedAt: new Date("2026-11-10") }),
        ],
        "SPORTS",
      )?.id,
    ).toBe(2);
    expect(
      chooseBankImage(
        [candidate({ id: 3, usageCount: 2, lastUsedAt: new Date("2026-11-10") }), candidate({ id: 4, usageCount: 2 })],
        "SPORTS",
      )?.id,
    ).toBe(4);
  });

  it("ne renvoie rien quand la banque n’a aucune image adaptée", () => {
    expect(chooseBankImage([candidate({ id: 1, bankCategory: "CULTURE" })], "SPORTS")).toBeNull();
    expect(chooseBankImage([], "SPORTS")).toBeNull();
  });
});

describe("parseBankCategory", () => {
  it("accepte une rubrique, toutes les rubriques ou aucune", () => {
    expect(parseBankCategory("SPORTS")).toEqual({ ok: true, value: "SPORTS" });
    expect(parseBankCategory(ALL_RUBRICS)).toEqual({ ok: true, value: ALL_RUBRICS });
    expect(parseBankCategory("")).toEqual({ ok: true, value: null });
    expect(parseBankCategory(null)).toEqual({ ok: true, value: null });
  });

  it("refuse une rubrique inconnue", () => {
    expect(parseBankCategory("PEOPLE")).toEqual({
      ok: false,
      error: "Rubrique de la banque d’images inconnue.",
    });
  });
});

describe("BANK_CATEGORY_OPTIONS", () => {
  it("propose chaque rubrique du site, toutes les rubriques et la sortie de la banque", async () => {
    const { BANK_CATEGORY_OPTIONS } = await import("./bankImage");
    const { CANONICAL_EDITORIAL_CATEGORIES } = await import("@/lib/article-engine/normalizeEditorialCategory");

    const values = BANK_CATEGORY_OPTIONS.map(({ value }) => value);

    expect(values).toEqual(expect.arrayContaining(["", ALL_RUBRICS, ...CANONICAL_EDITORIAL_CATEGORIES]));
    expect(values).toHaveLength(CANONICAL_EDITORIAL_CATEGORIES.length + 2);
  });
});
