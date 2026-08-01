import { DeterministicEditorialGenerator } from "./generators/DeterministicEditorialGenerator";
import type {
  EditorialGenerator,
  TranslationLocale,
} from "./generators/EditorialGenerator";
import type { ArticleRepository } from "./repositories/ArticleRepository";
import type {
  ArticleTranslationRepository,
  ArticleTranslationStatus,
} from "./repositories/ArticleTranslationRepository";
import { PrismaArticleRepository } from "./repositories/PrismaArticleRepository";
import { PrismaArticleTranslationRepository } from "./repositories/PrismaArticleTranslationRepository";

export type TranslationGenerationAction =
  | "created"
  | "updated"
  | "skipped";

export interface GeneratedTranslationResult {
  locale: TranslationLocale;
  translationId: number;
  action: TranslationGenerationAction;
}

export interface GenerateArticleTranslationsResult {
  articleId: number;
  translations: GeneratedTranslationResult[];
}

export interface GenerateArticleTranslationsDependencies {
  articleRepository: Pick<
    ArticleRepository,
    "findById"
  >;

  translationRepository: ArticleTranslationRepository;

  editorialGenerator: Pick<
    EditorialGenerator,
    "translateArticle"
  >;
}

const defaultDependencies: GenerateArticleTranslationsDependencies = {
  articleRepository:
    new PrismaArticleRepository(),

  translationRepository:
    new PrismaArticleTranslationRepository(),

  editorialGenerator:
    new DeterministicEditorialGenerator(),
};

const targetLocales: TranslationLocale[] = [
  "CA",
  "ES",
];

function isEditableStatus(
  status: ArticleTranslationStatus,
): boolean {
  return (
    status === "DRAFT" ||
    status === "AI_DRAFT"
  );
}

export async function generateArticleTranslations(
  articleId: number,
  dependencies = defaultDependencies,
): Promise<GenerateArticleTranslationsResult> {
  if (
    !Number.isInteger(articleId) ||
    articleId <= 0
  ) {
    throw new Error(
      "Identifiant d’article invalide.",
    );
  }

  const article =
    await dependencies.articleRepository.findById(
      articleId,
    );

  if (!article) {
    throw new Error(
      "Article introuvable.",
    );
  }

  const translations: GeneratedTranslationResult[] = [];

  for (const locale of targetLocales) {
    const existing =
      await dependencies.translationRepository
        .findByArticleAndLocale(
          article.id,
          locale,
        );

    if (
      existing &&
      !isEditableStatus(existing.status)
    ) {
      translations.push({
        locale,
        translationId: existing.id,
        action: "skipped",
      });

      continue;
    }

    const prepared =
      await dependencies.editorialGenerator
        .translateArticle({
          locale,
          title: article.title,
          description: article.description,
          content: article.content,
        });

    const draft = {
      articleId: article.id,
      locale,
      title: prepared.title,
      description: prepared.description,
      content: prepared.content,
    };

    if (existing) {
      await dependencies.translationRepository
        .updateDraft(
          existing.id,
          draft,
        );

      translations.push({
        locale,
        translationId: existing.id,
        action: "updated",
      });
    } else {
      const translationId =
        await dependencies.translationRepository
          .createDraft(draft);

      translations.push({
        locale,
        translationId,
        action: "created",
      });
    }
  }

  return {
    articleId: article.id,
    translations,
  };
}
