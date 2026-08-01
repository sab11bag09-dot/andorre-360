import type {
  EditorialStatus,
} from "@/lib/generated/prisma/client";

import type { TranslationLocale } from "../generators/EditorialGenerator";

export type { TranslationLocale };

export type ArticleTranslationStatus =
  EditorialStatus;

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

export interface ArticleTranslationContentInput {
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

  updateContent(
    translationId: number,
    input: ArticleTranslationContentInput,
  ): Promise<void>;

  transitionStatus(
    translationId: number,
    currentStatus: ArticleTranslationStatus,
    nextStatus: ArticleTranslationStatus,
  ): Promise<void>;

  publishApproved(
    translationId: number,
  ): Promise<void>;
}
