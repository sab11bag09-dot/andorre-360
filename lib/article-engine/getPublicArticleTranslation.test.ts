import { describe, expect, it, vi } from "vitest";

import {
  getPublicArticleTranslation,
  isPublicTranslationLocale,
} from "./getPublicArticleTranslation";
import type {
  PublicArticleTranslation,
  PublicArticleTranslationRepository,
} from "./repositories/PublicArticleTranslationRepository";

function createRepository(
  result: PublicArticleTranslation | null,
): PublicArticleTranslationRepository {
  return {
    findPublishedByLocaleAndSlug: vi.fn().mockResolvedValue(result),
  };
}

const publishedTranslation: PublicArticleTranslation = {
  articleId: 42,
  locale: "CA",
  title: "Títol publicat",
  description: "Descripció",
  seoTitle: null,
  seoDescription: null,
  content: "Contingut",
  slug: "titol-publicat",
  publishedAt: new Date("2026-08-01T12:00:00.000Z"),
  category: "Societat",
  image: null,
  author: "Redacció",
  readingTime: "2 min",
  videoUrl: null,
};

describe("getPublicArticleTranslation", () => {
  it("convertit explicitement ca vers CA", async () => {
    const repository = createRepository(publishedTranslation);

    await expect(
      getPublicArticleTranslation(
        "ca",
        "titol-publicat",
        repository,
      ),
    ).resolves.toEqual(publishedTranslation);

    expect(
      repository.findPublishedByLocaleAndSlug,
    ).toHaveBeenCalledWith("CA", "titol-publicat");
  });

  it("convertit explicitement es vers ES", async () => {
    const repository = createRepository(null);

    await expect(
      getPublicArticleTranslation(
        "es",
        "titulo-publicado",
        repository,
      ),
    ).resolves.toBeNull();

    expect(
      repository.findPublishedByLocaleAndSlug,
    ).toHaveBeenCalledWith("ES", "titulo-publicado");
  });
});

describe("isPublicTranslationLocale", () => {
  it.each(["ca", "es"])("accepte la langue %s", (locale) => {
    expect(isPublicTranslationLocale(locale)).toBe(true);
  });

  it.each(["fr", "en", "CA", ""])(
    "refuse la langue publique inconnue %s",
    (locale) => {
      expect(isPublicTranslationLocale(locale)).toBe(false);
    },
  );
});
