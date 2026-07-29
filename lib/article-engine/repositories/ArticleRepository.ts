export interface ArticleDraftInput {
  title: string;
  description: string;
  content: string;
  category: string;
  author: string;
}

export interface ArticleRepository {
  createDraft(
    input: ArticleDraftInput,
  ): Promise<number>;
}