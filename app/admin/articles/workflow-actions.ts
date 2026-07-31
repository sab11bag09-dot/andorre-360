"use server";

import type { EditorialStatus } from "@/lib/generated/prisma/client";
import { revalidatePath } from "next/cache";

import { canTransitionEditorialStatus } from "@/lib/article-engine/editorialWorkflow";
import { prisma } from "@/lib/prisma";

async function transitionArticleEditorialStatus(
  articleId: number,
  nextStatus: EditorialStatus,
): Promise<void> {
  if (
    !Number.isInteger(articleId) ||
    articleId <= 0
  ) {
    throw new Error(
      "Identifiant d’article invalide.",
    );
  }

  const article =
    await prisma.article.findUnique({
      where: {
        id: articleId,
      },
      select: {
        editorialStatus: true,
      },
    });

  if (!article) {
    throw new Error(
      "Article introuvable.",
    );
  }

  if (
    !canTransitionEditorialStatus(
      article.editorialStatus,
      nextStatus,
    )
  ) {
    throw new Error(
      "Cette transition éditoriale est interdite.",
    );
  }

  const result =
    await prisma.article.updateMany({
      where: {
        id: articleId,
        editorialStatus:
          article.editorialStatus,
      },
      data: {
        editorialStatus: nextStatus,
      },
    });

  if (result.count !== 1) {
    throw new Error(
      "Le statut de l’article a changé. Recharge la page et réessaie.",
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/articles");
  revalidatePath(
    `/admin/articles/${articleId}`,
  );
}

export async function submitArticleForReviewAction(
  articleId: number,
): Promise<void> {
  await transitionArticleEditorialStatus(
    articleId,
    "REVIEW",
  );
}

export async function approveArticleAction(
  articleId: number,
): Promise<void> {
  await transitionArticleEditorialStatus(
    articleId,
    "APPROVED",
  );
}