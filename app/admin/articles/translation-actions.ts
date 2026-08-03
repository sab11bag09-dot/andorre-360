"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/admin/requireAdmin";
import {
  createGenerateArticleTranslationsDependencies,
} from "@/lib/article-engine/articleEngineComposition";
import { generateArticleTranslations } from "@/lib/article-engine/generateArticleTranslations";
import {
  publishArticleTranslation,
  transitionArticleTranslation,
  updateArticleTranslation,
  updateArticleTranslationSlug,
} from "@/lib/article-engine/manageArticleTranslation";
import {
  assertMultilingualPublicationEnabled,
} from "@/lib/config/multilingualPublication";
import { revalidateTranslatedPublicPages } from "@/lib/public-revalidation";

function getTranslationPath(
  articleId: number,
  locale: string,
): string {
  return `/admin/articles/${articleId}/translations/${locale}`;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Une erreur inattendue est survenue.";
}

async function runTranslationAction(
  articleId: number,
  locale: string,
  successMessage: string,
  action: () => Promise<void>,
): Promise<never> {
  let errorMessage: string | null = null;

  try {
    await requireAdmin();
    await action();
  } catch (error) {
    errorMessage = getErrorMessage(error);
  }

  const path = getTranslationPath(articleId, locale);

  if (errorMessage) {
    redirect(
      `${path}?error=${encodeURIComponent(errorMessage)}`,
    );
  }

  revalidateArticleTranslationPaths(articleId, locale);
  redirect(
    `${path}?success=${encodeURIComponent(successMessage)}`,
  );
}

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

    revalidateTranslatedPublicPages(locale);
  }
}

export async function generateArticleTranslationsAction(
  articleId: number,
): Promise<void> {
  await requireAdmin();

  await generateArticleTranslations(
    articleId,
    createGenerateArticleTranslationsDependencies(),
  );

  revalidateArticleTranslationPaths(
    articleId,
  );
}

export async function updateArticleTranslationAction(
  articleId: number,
  locale: string,
  formData: FormData,
): Promise<never> {
  return runTranslationAction(
    articleId,
    locale,
    "Corrections enregistrées.",
    async () => {
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
    },
  );
}

export async function updateArticleTranslationSlugAction(
  articleId: number,
  locale: string,
  formData: FormData,
): Promise<never> {
  return runTranslationAction(
    articleId,
    locale,
    "Slug enregistré.",
    async () => {
      await updateArticleTranslationSlug({
        articleId,
        locale,
        slug:
          formData.get("slug")?.toString() ??
          "",
      });
    },
  );
}

export async function submitArticleTranslationForReviewAction(
  articleId: number,
  locale: string,
): Promise<never> {
  return runTranslationAction(
    articleId,
    locale,
    "Traduction envoyée en relecture.",
    async () => {
      await transitionArticleTranslation({
        articleId,
        locale,
        nextStatus: "REVIEW",
      });
    },
  );
}

export async function returnArticleTranslationToDraftAction(
  articleId: number,
  locale: string,
): Promise<never> {
  return runTranslationAction(
    articleId,
    locale,
    "Traduction revenue au brouillon.",
    async () => {
      await transitionArticleTranslation({
        articleId,
        locale,
        nextStatus: "DRAFT",
      });
    },
  );
}

export async function returnApprovedTranslationToReviewAction(
  articleId: number,
  locale: string,
): Promise<never> {
  return runTranslationAction(
    articleId,
    locale,
    "Traduction renvoyée en relecture.",
    async () => {
      await transitionArticleTranslation({
        articleId,
        locale,
        nextStatus: "REVIEW",
      });
    },
  );
}

export async function approveArticleTranslationAction(
  articleId: number,
  locale: string,
): Promise<never> {
  return runTranslationAction(
    articleId,
    locale,
    "Traduction approuvée.",
    async () => {
      await transitionArticleTranslation({
        articleId,
        locale,
        nextStatus: "APPROVED",
      });
    },
  );
}

export async function publishArticleTranslationAction(
  articleId: number,
  locale: string,
): Promise<never> {
  return runTranslationAction(
    articleId,
    locale,
    "Traduction publiée.",
    async () => {
      assertMultilingualPublicationEnabled();

      await publishArticleTranslation({
        articleId,
        locale,
      });
    },
  );
}

export async function archiveArticleTranslationAction(
  articleId: number,
  locale: string,
): Promise<never> {
  return runTranslationAction(
    articleId,
    locale,
    "Traduction retirée de la publication.",
    async () => {
      await transitionArticleTranslation({
        articleId,
        locale,
        nextStatus: "ARCHIVED",
      });
    },
  );
}
