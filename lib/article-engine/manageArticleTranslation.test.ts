import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  transitionArticleTranslation,
  updateArticleTranslation,
  type ManageArticleTranslationDependencies,
} from "./manageArticleTranslation";
import type {
  ArticleTranslationRecord,
  ArticleTranslationStatus,
} from "./repositories/ArticleTranslationRepository";

function makeDependencies(
  translation: ArticleTranslationRecord | null,
) {
  const findByArticleAndLocale = vi.fn(
    async () => translation,
  );

  const updateContent = vi.fn(
    async () => undefined,
  );

  const transitionStatus = vi.fn(
    async () => undefined,
  );

  const dependencies: ManageArticleTranslationDependencies = {
    translationRepository: {
      findByArticleAndLocale,
      updateContent,
      transitionStatus,
    },
  };

  return {
    dependencies,
    findByArticleAndLocale,
    updateContent,
    transitionStatus,
  };
}

describe("manageArticleTranslation", () => {
  it.each([
    {
      articleId: 0,
      locale: "CA",
      message:
        "Identifiant d’article invalide.",
    },
    {
      articleId: 7,
      locale: "FR",
      message:
        "Langue de traduction invalide.",
    },
  ])(
    "refuse une référence invalide",
    async ({
      articleId,
      locale,
      message,
    }) => {
      const {
        dependencies,
        findByArticleAndLocale,
      } = makeDependencies(null);

      await expect(
        transitionArticleTranslation(
          {
            articleId,
            locale,
            nextStatus: "REVIEW",
          },
          dependencies,
        ),
      ).rejects.toThrow(message);

      expect(
        findByArticleAndLocale,
      ).not.toHaveBeenCalled();
    },
  );

  it("refuse une traduction introuvable", async () => {
    const {
      dependencies,
      updateContent,
    } = makeDependencies(null);

    await expect(
      updateArticleTranslation(
        {
          articleId: 7,
          locale: "ES",
          title: "Título",
          description: "Entradilla",
          content: "Contenido",
        },
        dependencies,
      ),
    ).rejects.toThrow(
      "Traduction introuvable.",
    );

    expect(updateContent).not.toHaveBeenCalled();
  });

  it("normalise et enregistre un brouillon", async () => {
    const {
      dependencies,
      updateContent,
    } = makeDependencies({
      id: 12,
      status: "AI_DRAFT",
    });

    const result =
      await updateArticleTranslation(
        {
          articleId: 7,
          locale: "CA",
          title: "  Títol  ",
          description:
            "  Entradeta  ",
          content: "  Contingut  ",
        },
        dependencies,
      );

    expect(result).toEqual({
      translationId: 12,
      status: "DRAFT",
    });

    expect(updateContent).toHaveBeenCalledWith(
      12,
      {
        title: "Títol",
        description: "Entradeta",
        content: "Contingut",
      },
    );
  });

  it("verrouille le contenu en relecture", async () => {
    const {
      dependencies,
      updateContent,
    } = makeDependencies({
      id: 12,
      status: "REVIEW",
    });

    await expect(
      updateArticleTranslation(
        {
          articleId: 7,
          locale: "CA",
          title: "Títol",
          description: "Entradeta",
          content: "Contingut",
        },
        dependencies,
      ),
    ).rejects.toThrow(
      "La traduction doit être en brouillon",
    );

    expect(updateContent).not.toHaveBeenCalled();
  });

  it.each([
    {
      currentStatus:
        "AI_DRAFT" as ArticleTranslationStatus,
      nextStatus:
        "REVIEW" as ArticleTranslationStatus,
    },
    {
      currentStatus:
        "REVIEW" as ArticleTranslationStatus,
      nextStatus:
        "APPROVED" as ArticleTranslationStatus,
    },
  ])(
    "autorise $currentStatus vers $nextStatus",
    async ({
      currentStatus,
      nextStatus,
    }) => {
      const {
        dependencies,
        transitionStatus,
      } = makeDependencies({
        id: 12,
        status: currentStatus,
      });

      const result =
        await transitionArticleTranslation(
          {
            articleId: 7,
            locale: "ES",
            nextStatus,
          },
          dependencies,
        );

      expect(result).toEqual({
        translationId: 12,
        status: nextStatus,
      });

      expect(
        transitionStatus,
      ).toHaveBeenCalledWith(
        12,
        currentStatus,
        nextStatus,
      );
    },
  );

  it("interdit la publication directe", async () => {
    const {
      dependencies,
      transitionStatus,
    } = makeDependencies({
      id: 12,
      status: "AI_DRAFT",
    });

    await expect(
      transitionArticleTranslation(
        {
          articleId: 7,
          locale: "CA",
          nextStatus: "PUBLISHED",
        },
        dependencies,
      ),
    ).rejects.toThrow(
      "Cette transition de traduction est interdite.",
    );

    expect(
      transitionStatus,
    ).not.toHaveBeenCalled();
  });
});
