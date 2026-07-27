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

export async function getArticlesByCategory(category: string) {
  const articles = await prisma.article.findMany({
    where: {
      category,
      published: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
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