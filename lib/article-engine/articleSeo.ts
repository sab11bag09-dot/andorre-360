import type { Metadata } from "next";

import { PrismaPublicArticleSeoRepository } from "./repositories/PrismaPublicArticleSeoRepository";
import type {
  PublicArticleSeoRepository,
  PublicArticleSeoVersions,
} from "./repositories/PublicArticleSeoRepository";

export type PublicArticleLanguage = "fr" | "ca" | "es";

interface CreateArticleMetadataInput {
  language: PublicArticleLanguage;
  slug: string;
  title: string;
  description: string;
  image: string | null;
  publishedAt: Date;
  versions: PublicArticleSeoVersions;
}

const openGraphLocales: Record<PublicArticleLanguage, string> = {
  fr: "fr_AD",
  ca: "ca_AD",
  es: "es_AD",
};

export function getPublicArticlePath(
  language: PublicArticleLanguage,
  slug: string,
): string {
  return language === "fr"
    ? `/article/${slug}`
    : `/${language}/article/${slug}`;
}

export async function getPublicArticleSeoVersions(
  articleId: number,
  repository: PublicArticleSeoRepository =
    new PrismaPublicArticleSeoRepository(),
): Promise<PublicArticleSeoVersions | null> {
  return repository.findPublishedVersionsByArticleId(articleId);
}

export function createArticleMetadata({
  language,
  slug,
  title,
  description,
  image,
  publishedAt,
  versions,
}: CreateArticleMetadataInput): Metadata {
  const canonical = getPublicArticlePath(language, slug);
  const languages: Record<string, string> = {};

  if (versions.frenchSlug) {
    languages.fr = getPublicArticlePath(
      "fr",
      versions.frenchSlug,
    );
  }

  for (const version of versions.translations) {
    const translatedLanguage =
      version.locale === "CA" ? "ca" : "es";
    languages[translatedLanguage] = getPublicArticlePath(
      translatedLanguage,
      version.slug,
    );
  }

  languages["x-default"] =
    languages.fr ?? canonical;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      type: "article",
      locale: openGraphLocales[language],
      title,
      description,
      url: canonical,
      publishedTime: publishedAt.toISOString(),
      ...(image ? { images: [image] } : {}),
    },
  };
}
