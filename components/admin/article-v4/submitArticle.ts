import { saveArticle } from "@/actions/article-v4";

import type {
  ArticleDraft,
  ArticleEditorMode,
  ArticleSubmissionIntent,
  SaveArticleResult,
} from "./types";

export type SubmitArticleInput = {
  mode: ArticleEditorMode;
  intent: ArticleSubmissionIntent;
  draft: ArticleDraft;
};

export async function submitArticle({
  mode,
  intent,
  draft,
}: SubmitArticleInput): Promise<SaveArticleResult> {
  return saveArticle({
    mode,
    intent,
    article: draft,
  });
}