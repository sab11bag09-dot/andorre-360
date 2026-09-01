import { describe, expect, it } from "vitest";

import {
  assertRequiredTranslationsPublished,
  getMissingPublishedTranslationLocales,
} from "./multilingualPublicationGuard";

describe("protection de la publication multilingue", () => {
  it("accepte les traductions catalane et espagnole publiées", () => {
    expect(
      getMissingPublishedTranslationLocales([
        { locale: "CA", status: "PUBLISHED" },
        { locale: "ES", status: "PUBLISHED" },
      ]),
    ).toEqual([]);

    expect(() =>
      assertRequiredTranslationsPublished([
        { locale: "CA", status: "PUBLISHED" },
        { locale: "ES", status: "PUBLISHED" },
      ]),
    ).not.toThrow();
  });

  it("signale une traduction absente", () => {
    expect(
      getMissingPublishedTranslationLocales([
        { locale: "CA", status: "PUBLISHED" },
      ]),
    ).toEqual(["ES"]);
  });

  it("refuse une traduction qui existe mais n’est pas publiée", () => {
    expect(() =>
      assertRequiredTranslationsPublished([
        { locale: "CA", status: "APPROVED" },
        { locale: "ES", status: "AI_DRAFT" },
      ]),
    ).toThrow(
      "Les traductions suivantes doivent être publiées avant l’article : CA, ES.",
    );
  });
});
