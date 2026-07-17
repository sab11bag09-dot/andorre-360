import { prisma } from "@/lib/prisma";

export async function getPublishedArticles() {
  return prisma.article.findMany({
    where: {
      published: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getArticlesByCategory(category: string) {
  return prisma.article.findMany({
    where: {
      category,
      published: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getArticleBySlug(slug: string) {
  return prisma.article.findUnique({
    where: {
      slug,
    },
  });
}

export async function getFeaturedArticle() {
  return prisma.article.findFirst({
    where: {
      featured: true,
      published: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}