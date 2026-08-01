"use server";

import { revalidatePath } from "next/cache";

import { generateArticleTranslations } from "@/lib/article-engine/generateArticleTranslations";
import {
  transitionArticleTranslation,
  updateArticleTranslation,
} from "@/lib/article-engine/manageArticleTranslation";

function revalidateArticleTranslationPaths(
  articleId: number,
  locale?: string,
): void {
  revalidatePath("/admin");
  revalidatePath("/admin/articles");
  revalidatePath(
    `/admin/articles/${articleId}`,
  );

  if (locale) {
    revalidatePath(
      `/admin/articles/${articleId}/translations/${locale}`,
    );
  }
}

export async function generateArticleTranslationsAction(
  articleId: number,
): Promise<void> {
  await generateArticleTranslations(
    articleId,
  );

  revalidateArticleTranslationPaths(
    articleId,
  );
}

export async function updateArticleTranslationAction(
  articleId: number,
  locale: string,
  formData: FormData,
): Promise<void> {
  await updateArticleTranslation({
    articleId,
    locale,
    title:
      formData.get("title")?.toString() ??
      "",
    description:
      formData
        .get("description")
        ?.toString() ?? "",
    content:
      formData.get("content")?.toString() ??
      "",
  });

  revalidateArticleTranslationPaths(
    articleId,
    locale,
  );
}

export async function submitArticleTranslationForReviewAction(
  articleId: number,
  locale: string,
): Promise<void> {
  await transitionArticleTranslation({
    articleId,
    locale,
    nextStatus: "REVIEW",
  });

  revalidateArticleTranslationPaths(
    articleId,
    locale,
  );
}

export async function returnArticleTranslationToDraftAction(
  articleId: number,
  locale: string,
): Promise<void> {
  await transitionArticleTranslation({
    articleId,
    locale,
    nextStatus: "DRAFT",
  });

  revalidateArticleTranslationPaths(
    articleId,
    locale,
  );
}

export async function approveArticleTranslationAction(
  articleId: number,
  locale: string,
): Promise<void> {
  await transitionArticleTranslation({
    articleId,
    locale,
    nextStatus: "APPROVED",
  });

  revalidateArticleTranslationPaths(
    articleId,
    locale,
  );
}
