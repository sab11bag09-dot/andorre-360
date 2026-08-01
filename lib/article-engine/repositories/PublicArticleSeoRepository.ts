import type { ContentLocale } from "@/lib/generated/prisma/client";

export interface PublicArticleVersion {
  locale: ContentLocale;
  slug: string;
}

export interface PublicArticleSeoVersions {
  frenchSlug: string | null;
  translations: PublicArticleVersion[];
}

export interface PublicArticleSeoRepository {
  findPublishedVersionsByArticleId(
    articleId: number,
  ): Promise<PublicArticleSeoVersions | null>;
}
