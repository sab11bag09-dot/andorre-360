import type { MetadataRoute } from "next";

import { getPublicArticlePath, type PublicArticleLanguage } from "@/lib/article-engine/articleSeo";
import { prisma } from "@/lib/prisma";
import { PUBLIC_ARTICLE_FILTER } from "@/lib/public-article";
import { PUBLIC_CATEGORY_PATHS } from "@/lib/public-revalidation";

import { absoluteUrl, siteUrl } from "./siteUrl";

/**
 * Plan du site : la une, les rubriques, le fil info en trois langues et
 * chaque article publié, avec ses versions catalane et espagnole publiées.
 * Chaque version d’un article est listée avec toutes les autres (`hreflang`).
 */

/** Image générique des articles sans photo : elle ne décrit aucun article. */
const GENERIC_IMAGE = "/images/global/hero.jpg";

/** Rubriques qui renvoient vers une autre : absentes du plan. */
const REDIRECTED_PATHS = new Set(["/immobilier", "/lifestyle"]);

export type SitemapArticle = {
  slug: string;
  image: string | null;
  updatedAt: Date;
  translations: Array<{ locale: "CA" | "ES" | string; slug: string; updatedAt: Date }>;
};

function languageOf(locale: string): PublicArticleLanguage | null {
  if (locale === "CA") return "ca";
  if (locale === "ES") return "es";
  return null;
}

export function buildSitemap(
  articles: readonly SitemapArticle[],
  options: { base: URL; now: Date },
): MetadataRoute.Sitemap {
  const url = (path: string) => absoluteUrl(path, options.base);

  const filInfo = { fr: url("/fil-info"), ca: url("/ca/fil-info"), es: url("/es/fil-info") };
  const fixed: MetadataRoute.Sitemap = [
    { url: url("/"), lastModified: options.now, changeFrequency: "hourly", priority: 1 },
    ...Object.values(filInfo).map((entry) => ({
      url: entry,
      lastModified: options.now,
      changeFrequency: "hourly" as const,
      priority: 0.8,
      alternates: { languages: { ...filInfo, "x-default": filInfo.fr } },
    })),
    ...[...new Set(Object.values(PUBLIC_CATEGORY_PATHS))]
      .filter((path) => !REDIRECTED_PATHS.has(path))
      .sort()
      .map((path) => ({
        url: url(path),
        lastModified: options.now,
        changeFrequency: "hourly" as const,
        priority: 0.7,
      })),
  ];

  const articleEntries = articles.flatMap((article) => {
    const versions = [
      { language: "fr" as PublicArticleLanguage, slug: article.slug, updatedAt: article.updatedAt },
      ...article.translations.flatMap((translation) => {
        const language = languageOf(translation.locale);
        return language ? [{ language, slug: translation.slug, updatedAt: translation.updatedAt }] : [];
      }),
    ];
    const languages: Record<string, string> = Object.fromEntries(
      versions.map((version) => [version.language, url(getPublicArticlePath(version.language, version.slug))]),
    );
    languages["x-default"] = languages.fr;
    const images = article.image && article.image !== GENERIC_IMAGE ? [url(article.image)] : undefined;

    return versions.map((version) => ({
      url: languages[version.language],
      lastModified: version.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.6,
      ...(versions.length > 1 ? { alternates: { languages } } : {}),
      ...(images ? { images } : {}),
    }));
  });

  return [...fixed, ...articleEntries];
}

/** Plafond du protocole : 50 000 adresses par plan ; trois par article au plus. */
const SITEMAP_ARTICLE_LIMIT = 15_000;

export async function loadSitemap(now = new Date()): Promise<MetadataRoute.Sitemap> {
  const articles = await prisma.article.findMany({
    where: PUBLIC_ARTICLE_FILTER,
    orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
    take: SITEMAP_ARTICLE_LIMIT,
    select: {
      slug: true,
      image: true,
      updatedAt: true,
      translations: {
        where: { status: "PUBLISHED", publishedAt: { not: null }, locale: { in: ["CA", "ES"] } },
        select: { locale: true, slug: true, updatedAt: true },
      },
    },
  });

  return buildSitemap(articles, { base: siteUrl(), now });
}
