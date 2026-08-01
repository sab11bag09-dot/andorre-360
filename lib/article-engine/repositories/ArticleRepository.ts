export interface ArticleDraftInput {
  title: string;
  description: string;
  content: string;
  category: string;
  author: string;
}

export interface ArticleForTranslation {
  id: number;
  title: string;
  description: string;
  content: string;
}

export interface ArticleRepository {
  findById(
    articleId: number,
  ): Promise<ArticleForTranslation | null>;

  createDraft(
    input: ArticleDraftInput,
  ): Promise<number>;

  updateDraft(
    articleId: number,
    input: ArticleDraftInput,
  ): Promise<void>;
}