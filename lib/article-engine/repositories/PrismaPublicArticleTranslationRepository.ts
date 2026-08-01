import { prisma } from "@/lib/prisma";
import type { PrismaClient } from "@/lib/generated/prisma/client";

import type {
  PublicArticleTranslation,
  PublicArticleTranslationRepository,
} from "./PublicArticleTranslationRepository";
import type { ContentLocale } from "@/lib/generated/prisma/client";

export class PrismaPublicArticleTranslationRepository
  implements PublicArticleTranslationRepository
{
  constructor(
    private readonly client: Pick<PrismaClient, "articleTranslation"> = prisma,
  ) {}

  async findPublishedByLocaleAndSlug(
    locale: ContentLocale,
    slug: string,
  ): Promise<PublicArticleTranslation | null> {
    const translation = await this.client.articleTranslation.findFirst({
      where: {
        locale,
        slug,
        status: "PUBLISHED",
      },
      select: {
        articleId: true,
        locale: true,
        title: true,
        description: true,
        seoTitle: true,
        seoDescription: true,
        content: true,
        slug: true,
        publishedAt: true,
        article: {
          select: {
            category: true,
            image: true,
            author: true,
            readingTime: true,
            videoUrl: true,
          },
        },
      },
    });

    if (!translation?.publishedAt) {
      return null;
    }

    return {
      articleId: translation.articleId,
      locale: translation.locale,
      title: translation.title,
      description: translation.description,
      seoTitle: translation.seoTitle,
      seoDescription: translation.seoDescription,
      content: translation.content,
      slug: translation.slug,
      publishedAt: translation.publishedAt,
      category: translation.article.category,
      image: translation.article.image.trim() || null,
      author: translation.article.author,
      readingTime: translation.article.readingTime,
      videoUrl: translation.article.videoUrl,
    };
  }
}
