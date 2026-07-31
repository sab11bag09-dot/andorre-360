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

export interface EditorialGenerator {
  prepareArticle(
    input: PrepareArticleInput,
  ): Promise<PreparedArticle>;
}