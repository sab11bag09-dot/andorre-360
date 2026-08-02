import { prisma } from "@/lib/prisma";
import { PUBLIC_ARTICLE_FILTER } from "@/lib/public-article";

import type {
  PublicArticleSeoRepository,
  PublicArticleSeoVersions,
} from "./PublicArticleSeoRepository";

export class PrismaPublicArticleSeoRepository
  implements PublicArticleSeoRepository
{
  async findPublishedVersionsByArticleId(
    articleId: number,
  ): Promise<PublicArticleSeoVersions | null> {
    const article = await prisma.article.findFirst({
      where: {
        id: articleId,
        ...PUBLIC_ARTICLE_FILTER,
      },
      select: {
        slug: true,
        translations: {
          where: {
            status: "PUBLISHED",
            publishedAt: {
              not: null,
            },
            locale: {
              in: ["CA", "ES"],
            },
          },
          select: {
            locale: true,
            slug: true,
          },
        },
      },
    });

    if (!article) {
      return null;
    }

    return {
      frenchSlug: article.slug,
      translations: article.translations,
    };
  }
}
