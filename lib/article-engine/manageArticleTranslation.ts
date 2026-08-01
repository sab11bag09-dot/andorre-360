import { canTransitionEditorialStatus } from "./editorialWorkflow";
import type {
  ArticleTranslationRepository,
  ArticleTranslationStatus,
  TranslationLocale,
} from "./repositories/ArticleTranslationRepository";
import { PrismaArticleTranslationRepository } from "./repositories/PrismaArticleTranslationRepository";

export interface UpdateArticleTranslationInput {
  articleId: number;
  locale: string;
  title: string;
  description: string;
  content: string;
}

export interface TransitionArticleTranslationInput {
  articleId: number;
  locale: string;
  nextStatus: ArticleTranslationStatus;
}

export interface ManageArticleTranslationResult {
  translationId: number;
  status: ArticleTranslationStatus;
}

export interface ManageArticleTranslationDependencies {
  translationRepository: Pick<
    ArticleTranslationRepository,
    | "findByArticleAndLocale"
    | "updateContent"
    | "transitionStatus"
  >;
}

const defaultDependencies: ManageArticleTranslationDependencies = {
  translationRepository:
    new PrismaArticleTranslationRepository(),
};

function isTranslationLocale(
  locale: string,
): locale is TranslationLocale {
  return (
    locale === "CA" ||
    locale === "ES"
  );
}

function assertTranslationReference(
  articleId: number,
  locale: string,
): asserts locale is TranslationLocale {
  if (
    !Number.isInteger(articleId) ||
    articleId <= 0
  ) {
    throw new Error(
      "Identifiant d’article invalide.",
    );
  }

  if (!isTranslationLocale(locale)) {
    throw new Error(
      "Langue de traduction invalide.",
    );
  }
}

export async function updateArticleTranslation(
  input: UpdateArticleTranslationInput,
  dependencies = defaultDependencies,
): Promise<ManageArticleTranslationResult> {
  assertTranslationReference(
    input.articleId,
    input.locale,
  );

  const title = input.title.trim();
  const description =
    input.description.trim();
  const content = input.content.trim();

  if (
    !title ||
    !description ||
    !content
  ) {
    throw new Error(
      "Le titre, le chapô et le contenu sont obligatoires.",
    );
  }

  const translation =
    await dependencies.translationRepository
      .findByArticleAndLocale(
        input.articleId,
        input.locale,
      );

  if (!translation) {
    throw new Error(
      "Traduction introuvable.",
    );
  }

  if (
    translation.status !== "DRAFT" &&
    translation.status !== "AI_DRAFT"
  ) {
    throw new Error(
      "La traduction doit être en brouillon pour être modifiée.",
    );
  }

  await dependencies.translationRepository
    .updateContent(
      translation.id,
      {
        title,
        description,
        content,
      },
    );

  return {
    translationId: translation.id,
    status: "DRAFT",
  };
}

export async function transitionArticleTranslation(
  input: TransitionArticleTranslationInput,
  dependencies = defaultDependencies,
): Promise<ManageArticleTranslationResult> {
  assertTranslationReference(
    input.articleId,
    input.locale,
  );

  const translation =
    await dependencies.translationRepository
      .findByArticleAndLocale(
        input.articleId,
        input.locale,
      );

  if (!translation) {
    throw new Error(
      "Traduction introuvable.",
    );
  }

  if (
    !canTransitionEditorialStatus(
      translation.status,
      input.nextStatus,
    )
  ) {
    throw new Error(
      "Cette transition de traduction est interdite.",
    );
  }

  await dependencies.translationRepository
    .transitionStatus(
      translation.id,
      translation.status,
      input.nextStatus,
    );

  return {
    translationId: translation.id,
    status: input.nextStatus,
  };
}
