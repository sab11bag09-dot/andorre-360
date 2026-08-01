import type { ContentLocale } from "@/lib/generated/prisma/client";

export interface PublicArticleTranslation {
  articleId: number;
  locale: ContentLocale;
  title: string;
  description: string;
  content: string;
  slug: string;
  publishedAt: Date;
  category: string;
  image: string | null;
  author: string;
  readingTime: string;
  videoUrl: string | null;
}

export interface PublicArticleTranslationRepository {
  findPublishedByLocaleAndSlug(
    locale: ContentLocale,
    slug: string,
  ): Promise<PublicArticleTranslation | null>;
}
