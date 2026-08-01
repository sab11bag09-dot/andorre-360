import { prisma } from "@/lib/prisma";

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
    const article = await prisma.article.findUnique({
      where: {
        id: articleId,
      },
      select: {
        published: true,
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
      frenchSlug: article.published
        ? article.slug
        : null,
      translations: article.translations,
    };
  }
}
