"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin/requireAdmin";
import { prisma } from "@/lib/prisma";
import { revalidateFilInfoPublicPages } from "@/lib/public-revalidation";

export type UpdateFilInfoSettingsInput = {
  articleId: number;
  visible: boolean;
  pinned: boolean;
  publishedAt: string;
  expectedUpdatedAt: string;
};

export type UpdateFilInfoSettingsResult =
  | {
      success: true;
      visible: boolean;
      pinned: boolean;
      publishedAt: string;
      updatedAt: string;
    }
  | {
      success: false;
      message: string;
    };

function parseDate(value: string): Date | null {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

export async function updateFilInfoSettings(
  input: UpdateFilInfoSettingsInput,
): Promise<UpdateFilInfoSettingsResult> {
  try {
    await requireAdmin();

    if (!Number.isInteger(input.articleId) || input.articleId <= 0) {
      return { success: false, message: "Article invalide." };
    }

    if (input.pinned && !input.visible) {
      return {
        success: false,
        message: "Un contenu épinglé doit rester visible dans le Fil info.",
      };
    }

    const publishedAt = parseDate(input.publishedAt);
    const expectedUpdatedAt = parseDate(input.expectedUpdatedAt);

    if (!publishedAt || !expectedUpdatedAt) {
      return {
        success: false,
        message: "La date de publication est invalide.",
      };
    }

    const updatedArticle = await prisma.$transaction(async (transaction) => {
      const article = await transaction.article.findUnique({
        where: { id: input.articleId },
        select: {
          id: true,
          published: true,
          editorialStatus: true,
          updatedAt: true,
        },
      });

      if (!article) {
        throw new Error("FIL_INFO_ARTICLE_NOT_FOUND");
      }

      if (article.updatedAt.getTime() !== expectedUpdatedAt.getTime()) {
        throw new Error("FIL_INFO_STALE_WRITE");
      }

      if (
        (input.visible || input.pinned) &&
        (!article.published || article.editorialStatus !== "PUBLISHED")
      ) {
        throw new Error("FIL_INFO_NOT_PUBLISHED");
      }

      if (input.pinned) {
        await transaction.article.updateMany({
          where: {
            filInfoPinned: true,
            id: { not: input.articleId },
          },
          data: { filInfoPinned: false },
        });
      }

      return transaction.article.update({
        where: { id: input.articleId },
        data: {
          filInfoVisible: input.visible,
          filInfoPinned: input.pinned,
          publishedAt,
        },
        select: {
          filInfoVisible: true,
          filInfoPinned: true,
          publishedAt: true,
          updatedAt: true,
        },
      });
    });

    revalidateFilInfoPublicPages();
    revalidatePath(`/admin/articles/${input.articleId}`);

    return {
      success: true,
      visible: updatedArticle.filInfoVisible,
      pinned: updatedArticle.filInfoPinned,
      publishedAt: updatedArticle.publishedAt?.toISOString() ?? "",
      updatedAt: updatedArticle.updatedAt.toISOString(),
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "FIL_INFO_ARTICLE_NOT_FOUND") {
        return { success: false, message: "Article introuvable." };
      }

      if (error.message === "FIL_INFO_STALE_WRITE") {
        return {
          success: false,
          message:
            "Cet article a été modifié ailleurs. Recharge la page avant de réessayer.",
        };
      }

      if (error.message === "FIL_INFO_NOT_PUBLISHED") {
        return {
          success: false,
          message:
            "Seul un article publié et approuvé peut apparaître dans le Fil info.",
        };
      }
    }

    console.error("Erreur pendant la mise à jour du Fil info :", error);

    return {
      success: false,
      message: "La mise à jour du Fil info a échoué.",
    };
  }
}
