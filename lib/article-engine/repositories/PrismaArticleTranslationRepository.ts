import { prisma } from "@/lib/prisma";
import { createLocalizedSlug } from "../localizedSlug";

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
        publishedAt: true,
      },
    });
  }

  async createDraft(
    input: ArticleTranslationDraftInput,
  ): Promise<number> {
    const slug = await this.resolveUniqueSlug(
      input.locale,
      createLocalizedSlug(input.title),
    );

    const translation =
      await prisma.articleTranslation.create({
        data: {
          articleId: input.articleId,
          locale: input.locale,
          title: input.title,
          slug,
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

  async resolveUniqueSlug(
    locale: TranslationLocale,
    desiredSlug: string,
    excludeTranslationId?: number,
  ): Promise<string> {
    let suffix = 1;

    while (true) {
      const candidate =
        suffix === 1
          ? desiredSlug
          : `${desiredSlug}-${suffix}`;

      const existing =
        await prisma.articleTranslation.findUnique({
          where: {
            locale_slug: {
              locale,
              slug: candidate,
            },
          },
          select: {
            id: true,
          },
        });

      if (
        !existing ||
        existing.id === excludeTranslationId
      ) {
        return candidate;
      }

      suffix += 1;
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

  async updateSlugBeforePublication(
    translationId: number,
    currentStatus: ArticleTranslationStatus,
    slug: string,
  ): Promise<void> {
    const result =
      await prisma.articleTranslation.updateMany({
        where: {
          id: translationId,
          status: currentStatus,
          publishedAt: null,
        },
        data: {
          slug,
        },
      });

    if (result.count !== 1) {
      throw new Error(
        "Le slug est verrouillé ou la traduction a changé. Recharge la page et réessaie.",
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
