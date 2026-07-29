import type {
  Article,
  Publication,
} from "@/lib/generated/prisma/client";

type PublicationWithArticle = Publication & {
  article: Article;
};

let nextArticleId = 1;

export function makeArticle(
  overrides: Partial<Article> = {}
): Article {
  const id = nextArticleId++;
  const now = new Date("2026-07-29T10:00:00.000Z");

  return {
    id,
    slug: `article-${id}`,
    title: `Article ${id}`,
    category: "Actualité",
    categoryId: null,
    description: "Résumé de l’article",
    content: "Contenu de l’article",
    image: "/images/test.jpg",
    author: "ANDORRE 360",
    readingTime: "3 min",
    contentType: "article",
    videoUrl: null,
    videoDuration: null,
    socialText: null,
    featured: false,
    published: true,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export function makePublication(
  overrides: Partial<PublicationWithArticle> = {}
): PublicationWithArticle {
  const now = new Date("2026-07-29T10:00:00.000Z");
  const article = makeArticle();
  

  return {
    id: 1,
    pageKey: "home",
    channel: "site",
    zone: "hero",
    priority: 1,
    active: true,
    startsAt: null,
    endsAt: null,
    createdAt: now,
    editionId: null,
    articleId: article.id,
    article,
    ...overrides,
  };
}