import type { TranslationLocale } from "../generators/EditorialGenerator";

export type { TranslationLocale };

export type ArticleTranslationStatus =
  | "DRAFT"
  | "AI_DRAFT"
  | "REVIEW"
  | "APPROVED"
  | "PUBLISHED"
  | "ARCHIVED";

export interface ArticleTranslationRecord {
  id: number;
  status: ArticleTranslationStatus;
}

export interface ArticleTranslationDraftInput {
  articleId: number;
  locale: TranslationLocale;
  title: string;
  description: string;
  content: string;
}

export interface ArticleTranslationRepository {
  findByArticleAndLocale(
    articleId: number,
    locale: TranslationLocale,
  ): Promise<ArticleTranslationRecord | null>;

  createDraft(
    input: ArticleTranslationDraftInput,
  ): Promise<number>;

  updateDraft(
    translationId: number,
    input: ArticleTranslationDraftInput,
  ): Promise<void>;
}
