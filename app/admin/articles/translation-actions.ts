"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { generateArticleTranslations } from "@/lib/article-engine/generateArticleTranslations";
import {
  publishArticleTranslation,
  transitionArticleTranslation,
  updateArticleTranslation,
} from "@/lib/article-engine/manageArticleTranslation";
import { prisma } from "@/lib/prisma";

async function assertAdminAction(): Promise<void> {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    throw new Error(
      "Action administrateur non autorisée.",
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      email: email.toLowerCase(),
    },
    select: {
      role: true,
      active: true,
    },
  });

  if (
    !user ||
    !user.active ||
    user.role !== "ADMIN"
  ) {
    throw new Error(
      "Action administrateur non autorisée.",
    );
  }
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

export async function publishArticleTranslationAction(
  articleId: number,
  locale: string,
): Promise<void> {
  await assertAdminAction();

  await publishArticleTranslation({
    articleId,
    locale,
  });

  revalidateArticleTranslationPaths(
    articleId,
    locale,
  );
}

export async function archiveArticleTranslationAction(
  articleId: number,
  locale: string,
): Promise<void> {
  await assertAdminAction();

  await transitionArticleTranslation({
    articleId,
    locale,
    nextStatus: "ARCHIVED",
  });

  revalidateArticleTranslationPaths(
    articleId,
    locale,
  );
}
