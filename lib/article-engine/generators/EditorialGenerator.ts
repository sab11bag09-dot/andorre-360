export interface PrepareArticleInput {
  originalTitle: string;
  originalContent: string;
  sourceName: string;
  sourceCategory: string | null;
}

export interface PreparedArticle {
  title: string;
  description: string;
  content: string;
  category: string;
  author: string;
}

export type TranslationLocale = "CA" | "ES";

export interface TranslateArticleInput {
  locale: TranslationLocale;
  title: string;
  description: string;
  content: string;
}

export interface PreparedTranslation {
  locale: TranslationLocale;
  title: string;
  description: string;
  content: string;
}

export interface EditorialGenerator {
  prepareArticle(
    input: PrepareArticleInput,
  ): Promise<PreparedArticle>;

  translateArticle(
    input: TranslateArticleInput,
  ): Promise<PreparedTranslation>;
}
