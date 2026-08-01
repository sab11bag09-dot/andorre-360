import PublicArticleView from "@/components/article/PublicArticleView";
import {
  getPublicArticleTranslation,
  isPublicTranslationLocale,
} from "@/lib/article-engine/getPublicArticleTranslation";
import {
  createArticleMetadata,
  getPublicArticleSeoVersions,
} from "@/lib/article-engine/articleSeo";
import { recordArticleView } from "@/lib/analytics";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type TranslatedArticlePageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({
  params,
}: TranslatedArticlePageProps): Promise<Metadata> {
  const { locale, slug } = await params;

  if (!isPublicTranslationLocale(locale)) {
    notFound();
  }

  const translation =
    await getPublicArticleTranslation(locale, slug);

  if (!translation) {
    notFound();
  }

  const versions =
    await getPublicArticleSeoVersions(
      translation.articleId,
    );

  if (!versions) {
    notFound();
  }

  return createArticleMetadata({
    language: locale,
    slug: translation.slug,
    title: translation.seoTitle ?? translation.title,
    description:
      translation.seoDescription ??
      translation.description,
    image: translation.image,
    publishedAt: translation.publishedAt,
    versions,
  });
}

export default async function TranslatedArticlePage({
  params,
}: TranslatedArticlePageProps) {
  const { locale, slug } = await params;

  if (!isPublicTranslationLocale(locale)) {
    notFound();
  }

  const translation = await getPublicArticleTranslation(locale, slug);

  if (!translation) {
    notFound();
  }

  await recordArticleView(translation.articleId);

  return (
    <PublicArticleView
      article={translation}
      dateLocale={locale === "ca" ? "ca-ES" : "es-ES"}
      contentLanguage={locale}
    />
  );
}
