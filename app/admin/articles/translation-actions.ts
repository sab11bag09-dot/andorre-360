"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  requireAdmin,
  type AdminIdentity,
} from "@/lib/admin/requireAdmin";
import {
  createGenerateArticleTranslationsDependencies,
} from "@/lib/article-engine/articleEngineComposition";
import { generateAuditedArticleTranslations } from "@/lib/article-engine/auditedTranslationGeneration";
import {
  publishAuditedArticleTranslation,
  transitionAuditedArticleTranslation,
  updateAuditedArticleTranslation,
  updateAuditedArticleTranslationSlug,
} from "@/lib/article-engine/auditedTranslationMutations";
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
  action: (admin: AdminIdentity) => Promise<void>,
): Promise<never> {
  let errorMessage: string | null = null;

  try {
    const admin = await requireAdmin();
    await action(admin);
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
  const admin = await requireAdmin();

  await generateAuditedArticleTranslations(
    articleId,
    admin,
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
    async (admin) => {
      await updateAuditedArticleTranslation(
        {
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
        },
        admin,
      );
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
    async (admin) => {
      await updateAuditedArticleTranslationSlug(
        {
          articleId,
          locale,
          slug:
            formData.get("slug")?.toString() ??
            "",
        },
        admin,
      );
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
    async (admin) => {
      await transitionAuditedArticleTranslation(
        {
          articleId,
          locale,
          nextStatus: "REVIEW",
        },
        admin,
      );
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
    async (admin) => {
      await transitionAuditedArticleTranslation(
        {
          articleId,
          locale,
          nextStatus: "DRAFT",
        },
        admin,
      );
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
    async (admin) => {
      await transitionAuditedArticleTranslation(
        {
          articleId,
          locale,
          nextStatus: "REVIEW",
        },
        admin,
      );
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
    async (admin) => {
      await transitionAuditedArticleTranslation(
        {
          articleId,
          locale,
          nextStatus: "APPROVED",
        },
        admin,
      );
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
    async (admin) => {
      assertMultilingualPublicationEnabled();

      await publishAuditedArticleTranslation(
        {
          articleId,
          locale,
        },
        admin,
      );
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
    async (admin) => {
      await transitionAuditedArticleTranslation(
        {
          articleId,
          locale,
          nextStatus: "ARCHIVED",
        },
        admin,
      );
    },
  );
}
