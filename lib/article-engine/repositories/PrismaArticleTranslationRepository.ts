import { prisma } from "@/lib/prisma";

import type {
  ArticleTranslationContentInput,
  ArticleTranslationDraftInput,
  ArticleTranslationRecord,
  ArticleTranslationRepository,
  ArticleTranslationStatus,
  TranslationLocale,
} from "./ArticleTranslationRepository";

export class PrismaArticleTranslationRepository
  implements ArticleTranslationRepository
{
  async findByArticleAndLocale(
    articleId: number,
    locale: TranslationLocale,
  ): Promise<ArticleTranslationRecord | null> {
    return prisma.articleTranslation.findUnique({
      where: {
        articleId_locale: {
          articleId,
          locale,
        },
      },
      select: {
        id: true,
        status: true,
      },
    });
  }

  async createDraft(
    input: ArticleTranslationDraftInput,
  ): Promise<number> {
    const translation =
      await prisma.articleTranslation.create({
        data: {
          articleId: input.articleId,
          locale: input.locale,
          title: input.title,
          slug: crypto.randomUUID(),
          description: input.description,
          content: input.content,
          status: "AI_DRAFT",
          generatedAt: new Date(),
        },
        select: {
          id: true,
        },
      });

    return translation.id;
  }

  async updateDraft(
    translationId: number,
    input: ArticleTranslationDraftInput,
  ): Promise<void> {
    const result =
      await prisma.articleTranslation.updateMany({
        where: {
          id: translationId,
          articleId: input.articleId,
          locale: input.locale,
          status: {
            in: ["DRAFT", "AI_DRAFT"],
          },
        },
        data: {
          title: input.title,
          description: input.description,
          content: input.content,
          status: "AI_DRAFT",
          generatedAt: new Date(),
        },
      });

    if (result.count !== 1) {
      throw new Error(
        "La traduction est introuvable ou déjà en cours de relecture.",
      );
    }
  }

  async updateContent(
    translationId: number,
    input: ArticleTranslationContentInput,
  ): Promise<void> {
    const result =
      await prisma.articleTranslation.updateMany({
        where: {
          id: translationId,
          status: {
            in: ["DRAFT", "AI_DRAFT"],
          },
        },
        data: {
          title: input.title,
          description: input.description,
          content: input.content,
          status: "DRAFT",
        },
      });

    if (result.count !== 1) {
      throw new Error(
        "La traduction est introuvable ou verrouillée pour relecture.",
      );
    }
  }

  async transitionStatus(
    translationId: number,
    currentStatus: ArticleTranslationStatus,
    nextStatus: ArticleTranslationStatus,
  ): Promise<void> {
    const approvedAt =
      nextStatus === "APPROVED"
        ? new Date()
        : nextStatus === "DRAFT" ||
            nextStatus === "REVIEW"
          ? null
          : undefined;

    const result =
      await prisma.articleTranslation.updateMany({
        where: {
          id: translationId,
          status: currentStatus,
        },
        data: {
          status: nextStatus,
          approvedAt,
        },
      });

    if (result.count !== 1) {
      throw new Error(
        "Le statut de la traduction a changé. Recharge la page et réessaie.",
      );
    }
  }

  async publishApproved(
    translationId: number,
    publishedAt: Date,
  ): Promise<void> {
    const result =
      await prisma.articleTranslation.updateMany({
        where: {
          id: translationId,
          status: "APPROVED",
        },
        data: {
          status: "PUBLISHED",
          publishedAt,
        },
      });

    if (result.count !== 1) {
      throw new Error(
        "Le statut de la traduction a changé. Recharge la page et réessaie.",
      );
    }
  }
}
