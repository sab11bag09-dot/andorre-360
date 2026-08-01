import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import type { TranslateArticleInput } from "./generators/EditorialGenerator";
import type { ArticleForTranslation } from "./repositories/ArticleRepository";
import type {
  ArticleTranslationDraftInput,
  ArticleTranslationRecord,
  TranslationLocale,
} from "./repositories/ArticleTranslationRepository";
import {
  generateArticleTranslations,
  type GenerateArticleTranslationsDependencies,
} from "./generateArticleTranslations";

const article: ArticleForTranslation = {
  id: 7,
  title: "Titre français",
  description: "Chapô français",
  content: "Contenu français",
};

function makeDependencies(
  sourceArticle: ArticleForTranslation | null = article,
  existingTranslations: Partial<
    Record<
      TranslationLocale,
      ArticleTranslationRecord
    >
  > = {},
) {
  const findById = vi.fn(
    async () => sourceArticle,
  );

  const findByArticleAndLocale = vi.fn(
    async (
      _articleId: number,
      locale: TranslationLocale,
    ) => existingTranslations[locale] ?? null,
  );

  const createDraft = vi.fn(
    async (
      input: ArticleTranslationDraftInput,
    ) => input.locale === "CA" ? 101 : 102,
  );

  const updateDraft = vi.fn(
    async () => undefined,
  );

  const translateArticle = vi.fn(
    async (
      input: TranslateArticleInput,
    ) => ({
      locale: input.locale,
      title:
        `[${input.locale}] ${input.title}`,
      description:
        `[${input.locale}] ${input.description}`,
      content:
        `[${input.locale}] ${input.content}`,
    }),
  );

  const dependencies: GenerateArticleTranslationsDependencies = {
    articleRepository: {
      findById,
    },
    translationRepository: {
      findByArticleAndLocale,
      createDraft,
      updateDraft,
    },
    editorialGenerator: {
      translateArticle,
    },
  };

  return {
    dependencies,
    findById,
    findByArticleAndLocale,
    createDraft,
    updateDraft,
    translateArticle,
  };
}

describe("generateArticleTranslations", () => {
  it("refuse un identifiant invalide", async () => {
    const {
      dependencies,
      findById,
    } = makeDependencies();

    await expect(
      generateArticleTranslations(
        0,
        dependencies,
      ),
    ).rejects.toThrow(
      "Identifiant d’article invalide.",
    );

    expect(findById).not.toHaveBeenCalled();
  });

  it("refuse un article introuvable", async () => {
    const {
      dependencies,
      findByArticleAndLocale,
    } = makeDependencies(null);

    await expect(
      generateArticleTranslations(
        999,
        dependencies,
      ),
    ).rejects.toThrow(
      "Article introuvable.",
    );

    expect(
      findByArticleAndLocale,
    ).not.toHaveBeenCalled();
  });

  it("crée les traductions catalane et espagnole", async () => {
    const {
      dependencies,
      createDraft,
      updateDraft,
      translateArticle,
    } = makeDependencies();

    const result =
      await generateArticleTranslations(
        article.id,
        dependencies,
      );

    expect(result).toEqual({
      articleId: article.id,
      translations: [
        {
          locale: "CA",
          translationId: 101,
          action: "created",
        },
        {
          locale: "ES",
          translationId: 102,
          action: "created",
        },
      ],
    });

    expect(
      translateArticle,
    ).toHaveBeenCalledTimes(2);

    expect(createDraft).toHaveBeenCalledWith({
      articleId: article.id,
      locale: "CA",
      title: "[CA] Titre français",
      description: "[CA] Chapô français",
      content: "[CA] Contenu français",
    });

    expect(createDraft).toHaveBeenCalledWith({
      articleId: article.id,
      locale: "ES",
      title: "[ES] Titre français",
      description: "[ES] Chapô français",
      content: "[ES] Contenu français",
    });

    expect(updateDraft).not.toHaveBeenCalled();
  });

  it("met à jour les traductions encore modifiables", async () => {
    const {
      dependencies,
      createDraft,
      updateDraft,
    } = makeDependencies(
      article,
      {
        CA: {
          id: 11,
          status: "DRAFT",
        },
        ES: {
          id: 12,
          status: "AI_DRAFT",
        },
      },
    );

    const result =
      await generateArticleTranslations(
        article.id,
        dependencies,
      );

    expect(result.translations).toEqual([
      {
        locale: "CA",
        translationId: 11,
        action: "updated",
      },
      {
        locale: "ES",
        translationId: 12,
        action: "updated",
      },
    ]);

    expect(createDraft).not.toHaveBeenCalled();

    expect(updateDraft).toHaveBeenCalledWith(
      11,
      expect.objectContaining({
        articleId: article.id,
        locale: "CA",
      }),
    );

    expect(updateDraft).toHaveBeenCalledWith(
      12,
      expect.objectContaining({
        articleId: article.id,
        locale: "ES",
      }),
    );
  });

  it("préserve les traductions relues ou publiées", async () => {
    const {
      dependencies,
      createDraft,
      updateDraft,
      translateArticle,
    } = makeDependencies(
      article,
      {
        CA: {
          id: 21,
          status: "REVIEW",
        },
        ES: {
          id: 22,
          status: "PUBLISHED",
        },
      },
    );

    const result =
      await generateArticleTranslations(
        article.id,
        dependencies,
      );

    expect(result.translations).toEqual([
      {
        locale: "CA",
        translationId: 21,
        action: "skipped",
      },
      {
        locale: "ES",
        translationId: 22,
        action: "skipped",
      },
    ]);

    expect(
      translateArticle,
    ).not.toHaveBeenCalled();

    expect(createDraft).not.toHaveBeenCalled();
    expect(updateDraft).not.toHaveBeenCalled();
  });
});
