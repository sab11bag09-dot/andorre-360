import { DeterministicEditorialGenerator } from "./generators/DeterministicEditorialGenerator";
import type {
  EditorialGenerator,
  TranslationLocale,
} from "./generators/EditorialGenerator";
import type { ArticleRepository } from "./repositories/ArticleRepository";
import type {
  ArticleTranslationDraftInput,
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

export type TranslationGenerationMutation = {
  articleId: number;
  locale: TranslationLocale;
  translationId: number;
  action: Exclude<TranslationGenerationAction, "skipped">;
  fromStatus?: ArticleTranslationStatus;
  toStatus: "AI_DRAFT";
};

export type PreparedTranslation =
  | {
      locale: TranslationLocale;
      draft: ArticleTranslationDraftInput;
    }
  | {
      locale: TranslationLocale;
      draft: null;
      translationId: number;
    };

export interface PreparedArticleTranslations {
  articleId: number;
  translations: PreparedTranslation[];
}

export interface GenerateArticleTranslationsDependencies {
  articleRepository: Pick<
    ArticleRepository,
    "findById"
  >;

  translationRepository: Pick<
    ArticleTranslationRepository,
    | "findByArticleAndLocale"
    | "createDraft"
    | "updateDraft"
  >;

  editorialGenerator: Pick<
    EditorialGenerator,
    "translateArticle"
  >;
}

export interface PersistArticleTranslationsDependencies {
  translationRepository: Pick<
    ArticleTranslationRepository,
    | "findByArticleAndLocale"
    | "createDraft"
    | "updateDraft"
  >;
  onMutation?: (
    mutation: TranslationGenerationMutation,
  ) => Promise<void>;
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
  "FR",
  "CA",
];

function isEditableStatus(
  status: ArticleTranslationStatus,
): boolean {
  return (
    status === "DRAFT" ||
    status === "AI_DRAFT"
  );
}

export async function prepareArticleTranslations(
  articleId: number,
  dependencies: Pick<
    GenerateArticleTranslationsDependencies,
    | "articleRepository"
    | "translationRepository"
    | "editorialGenerator"
  > = defaultDependencies,
): Promise<PreparedArticleTranslations> {
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

  const translations: PreparedTranslation[] = [];

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
        draft: null,
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

    translations.push({ locale, draft });
  }

  return {
    articleId: article.id,
    translations,
  };
}

export async function persistPreparedArticleTranslations(
  prepared: PreparedArticleTranslations,
  dependencies: PersistArticleTranslationsDependencies,
): Promise<GenerateArticleTranslationsResult> {
  const translations: GeneratedTranslationResult[] = [];

  for (const item of prepared.translations) {
    if (item.draft === null) {
      translations.push({
        locale: item.locale,
        translationId: item.translationId,
        action: "skipped",
      });
      continue;
    }

    const existing =
      await dependencies.translationRepository
        .findByArticleAndLocale(
          prepared.articleId,
          item.locale,
        );

    if (existing && !isEditableStatus(existing.status)) {
      translations.push({
        locale: item.locale,
        translationId: existing.id,
        action: "skipped",
      });
      continue;
    }

    const action = existing ? "updated" : "created";
    const translationId = existing
      ? existing.id
      : await dependencies.translationRepository.createDraft(
          item.draft,
        );

    if (existing) {
      await dependencies.translationRepository.updateDraft(
        existing.id,
        item.draft,
      );
    }

    await dependencies.onMutation?.({
      articleId: prepared.articleId,
      locale: item.locale,
      translationId,
      action,
      fromStatus: existing?.status,
      toStatus: "AI_DRAFT",
    });

    translations.push({
      locale: item.locale,
      translationId,
      action,
    });
  }

  return {
    articleId: prepared.articleId,
    translations,
  };
}

export async function generateArticleTranslations(
  articleId: number,
  dependencies = defaultDependencies,
): Promise<GenerateArticleTranslationsResult> {
  const prepared = await prepareArticleTranslations(
    articleId,
    dependencies,
  );

  return persistPreparedArticleTranslations(
    prepared,
    dependencies,
  );
}
