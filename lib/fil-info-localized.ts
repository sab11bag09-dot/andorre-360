import type { ContentLocale } from "@/lib/generated/prisma/client";

import { prisma } from "@/lib/prisma";
import { PUBLIC_ARTICLE_FILTER } from "@/lib/public-article";
import type { ArticleChronologyCursor } from "@/lib/articles";
import type { PublicFilInfoLocale } from "@/lib/fil-info-locale";

const prismaLocale: Record<Exclude<PublicFilInfoLocale, "fr">, ContentLocale> = {
  ca: "CA",
  es: "ES",
};

function chronologyBoundary(cursor: ArticleChronologyCursor, direction: "before" | "after") {
  const comparator = direction === "before" ? "lt" : "gt";
  return {
    OR: [
      { publishedAt: { [comparator]: cursor.publishedAt } },
      { publishedAt: cursor.publishedAt, createdAt: { [comparator]: cursor.createdAt } },
      { publishedAt: cursor.publishedAt, createdAt: cursor.createdAt, id: { [comparator]: cursor.id } },
    ],
  };
}

export async function getTranslatedFilInfoArticles(
  locale: Exclude<PublicFilInfoLocale, "fr">,
  options: {
    limit: number;
    before?: ArticleChronologyCursor;
    after?: ArticleChronologyCursor;
    excludePinned?: boolean;
    prioritizePinned?: boolean;
  },
) {
  const contentLocale = prismaLocale[locale];
  const boundary = options.before
    ? chronologyBoundary(options.before, "before")
    : options.after
      ? chronologyBoundary(options.after, "after")
      : undefined;
  const articles = await prisma.article.findMany({
    where: {
      category: "ACTUALITÉ",
      ...PUBLIC_ARTICLE_FILTER,
      filInfoVisible: true,
      ...(options.excludePinned ? { filInfoPinned: false } : {}),
      ...(boundary ? { AND: boundary } : {}),
      translations: { some: { locale: contentLocale, status: "PUBLISHED" } },
    },
    include: {
      translations: {
        where: { locale: contentLocale, status: "PUBLISHED" },
        take: 1,
      },
    },
    orderBy: [
      ...(options.prioritizePinned === false ? [] : [{ filInfoPinned: "desc" as const }]),
      { publishedAt: "desc" },
      { createdAt: "desc" },
      { id: "desc" },
    ],
    take: options.limit,
  });

  return articles.flatMap(({ translations, ...article }) => {
    const translation = translations[0];
    if (!translation) return [];
    return [{
      ...article,
      title: translation.title,
      slug: translation.slug,
      description: translation.description,
      content: translation.content,
      image: article.image?.trim() || null,
    }];
  });
}
