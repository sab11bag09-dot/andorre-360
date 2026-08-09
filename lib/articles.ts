import { prisma } from "@/lib/prisma";
import { PUBLIC_ARTICLE_FILTER } from "@/lib/public-article";

const SLOW_FIL_INFO_QUERY_MS = 250;
const PUBLIC_ARTICLE_QUERY_LIMIT = 50;

function normalizeImage<T extends { image: string | null }>(article: T): T {
  return {
    ...article,
    image: article.image?.trim() || null,
  };
}

export async function getPublishedArticles() {
  const articles = await prisma.article.findMany({
    where: {
      ...PUBLIC_ARTICLE_FILTER,
    },
    orderBy: [
      { publishedAt: "desc" },
      { createdAt: "desc" },
      { id: "desc" },
    ],
    take: PUBLIC_ARTICLE_QUERY_LIMIT,
  });

  return articles.map(normalizeImage);
}

type CategoryArticleQueryOptions = {
  limit?: number;
};

type FilInfoArticleQueryOptions = {
  limit?: number;
  before?: ArticleChronologyCursor;
  after?: ArticleChronologyCursor;
  prioritizePinned?: boolean;
  excludePinned?: boolean;
};

export type ArticleChronologyCursor = {
  publishedAt: Date;
  createdAt: Date;
  id: number;
};

function buildChronologyBoundary(
  cursor: ArticleChronologyCursor,
  direction: "before" | "after",
) {
  const comparator = direction === "before" ? "lt" : "gt";

  return {
    OR: [
      { publishedAt: { [comparator]: cursor.publishedAt } },
      {
        publishedAt: cursor.publishedAt,
        createdAt: { [comparator]: cursor.createdAt },
      },
      {
        publishedAt: cursor.publishedAt,
        createdAt: cursor.createdAt,
        id: { [comparator]: cursor.id },
      },
    ],
  };
}

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
      ...PUBLIC_ARTICLE_FILTER,
    },
    orderBy: [
      { publishedAt: "desc" },
      { createdAt: "desc" },
      { id: "desc" },
    ],
    take: options.limit ?? PUBLIC_ARTICLE_QUERY_LIMIT,
  });

  return articles.map(normalizeImage);
}

export async function getFilInfoArticles(
  category: string,
  options: FilInfoArticleQueryOptions = {},
) {
  const startedAt = performance.now();
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

  if (options.before && options.after) {
    throw new Error("Une seule borne chronologique peut être utilisée.");
  }

  const chronologyBoundary = options.before
    ? buildChronologyBoundary(options.before, "before")
    : options.after
      ? buildChronologyBoundary(options.after, "after")
      : undefined;

  const articles = await prisma.article.findMany({
    where: {
      category: normalizedCategory,
      ...PUBLIC_ARTICLE_FILTER,
      filInfoVisible: true,
      ...(options.excludePinned ? { filInfoPinned: false } : {}),
      ...(chronologyBoundary ? { AND: chronologyBoundary } : {}),
    },
    orderBy: [
      ...(options.prioritizePinned === false
        ? []
        : [{ filInfoPinned: "desc" as const }]),
      { publishedAt: "desc" },
      { createdAt: "desc" },
      { id: "desc" },
    ],
    take: options.limit ?? PUBLIC_ARTICLE_QUERY_LIMIT,
  });

  const durationMs = performance.now() - startedAt;

  if (durationMs >= SLOW_FIL_INFO_QUERY_MS) {
    console.warn(
      `[Fil info] Requête lente pour ${normalizedCategory}: ${Math.round(durationMs)} ms`,
    );
  }

  return articles.map(normalizeImage);
}

export async function getArticleBySlug(slug: string) {
  const article = await prisma.article.findFirst({
    where: {
      slug,
      ...PUBLIC_ARTICLE_FILTER,
    },
  });

  return article ? normalizeImage(article) : null;
}

function isUneExcluded(article: {
  title: string;
  category: string;
  description: string;
  image: string;
}) {
  const text = [article.title, article.category, article.description]
    .join(" ")
    .toLocaleLowerCase("fr");

  return /(parti politique|partis politiques|parti démocrate|parti socialiste|partit polític|partido político)/u.test(text);
}

function uneScore(article: {
  title: string;
  category: string;
  description: string;
  image: string;
  publishedAt: Date | null;
}) {
  const text = [article.title, article.category, article.description]
    .join(" ")
    .toLocaleLowerCase("fr");

  let score = article.image.trim() ? 10 : 0;
  if (/(gouvernement|loi|économie|société|international|sport|culture|sécurité|santé)/u.test(text)) {
    score += 20;
  }
  if (article.publishedAt) {
    const ageHours = (Date.now() - article.publishedAt.getTime()) / 3_600_000;
    score += Math.max(0, 20 - Math.min(20, ageHours / 3));
  }

  return score;
}

export async function getFeaturedArticleByCategory(category: string) {
  const normalizedCategory = category.trim();

  if (!normalizedCategory) {
    throw new Error("La catégorie est obligatoire.");
  }

  const candidates = await prisma.article.findMany({
    where: {
      category: normalizedCategory,
      ...PUBLIC_ARTICLE_FILTER,
    },
    orderBy: [
      { publishedAt: "desc" },
      { createdAt: "desc" },
      { id: "desc" },
    ],
    take: PUBLIC_ARTICLE_QUERY_LIMIT,
  });

  const eligible = candidates
    .map(normalizeImage)
    .filter((article) => Boolean(article.image))
    .filter((article) => !isUneExcluded(article));

  eligible.sort(
    (left, right) =>
      uneScore(right) - uneScore(left) ||
      (right.publishedAt?.getTime() ?? 0) - (left.publishedAt?.getTime() ?? 0) ||
      right.id - left.id,
  );

  return eligible[0] ?? null;
}

export async function getFeaturedArticle() {
  const candidates = await prisma.article.findMany({
    where: {
      ...PUBLIC_ARTICLE_FILTER,
    },
    orderBy: [
      { publishedAt: "desc" },
      { createdAt: "desc" },
      { id: "desc" },
    ],
    take: 50,
  });

  const eligible = candidates
    .map(normalizeImage)
    .filter((article) => !isUneExcluded(article))
    .filter((article) => Boolean(article.image))
    .map((article) => ({ ...article, image: article.image as string }));

  eligible.sort(
    (left, right) =>
      uneScore(right) - uneScore(left) ||
      (right.publishedAt?.getTime() ?? 0) - (left.publishedAt?.getTime() ?? 0) ||
      right.id - left.id,
  );

  return eligible[0] ?? null;
}
