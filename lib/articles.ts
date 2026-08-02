import { prisma } from "@/lib/prisma";

function normalizeImage<T extends { image: string | null }>(article: T): T {
  return {
    ...article,
    image: article.image?.trim() || null,
  };
}

export async function getPublishedArticles() {
  const articles = await prisma.article.findMany({
    where: {
      published: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return articles.map(normalizeImage);
}

type CategoryArticleQueryOptions = {
  limit?: number;
};

export async function getArticlesByCategory(
  category: string,
  options: CategoryArticleQueryOptions = {},
) {
  const normalizedCategory = category.trim();

  if (!normalizedCategory) {
    throw new Error("La catégorie est obligatoire.");
  }

  if (
    options.limit !== undefined &&
    (!Number.isInteger(options.limit) || options.limit <= 0)
  ) {
    throw new Error("La limite doit être un entier positif.");
  }

  const articles = await prisma.article.findMany({
    where: {
      category: normalizedCategory,
      published: true,
    },
    orderBy: [
      {
        publishedAt: "desc",
      },
      {
        createdAt: "desc",
      },
      {
        id: "desc",
      },
    ],
    take: options.limit,
  });

  return articles.map(normalizeImage);
}

export async function getArticleBySlug(slug: string) {
  const article = await prisma.article.findUnique({
    where: {
      slug,
    },
  });

  return article ? normalizeImage(article) : null;
}

export async function getFeaturedArticle() {
  const article = await prisma.article.findFirst({
    where: {
      featured: true,
      published: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return article ? normalizeImage(article) : null;
}
