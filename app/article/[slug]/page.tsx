import PublicArticleView from "@/components/article/PublicArticleView";
import {
  createArticleMetadata,
  getPublicArticleSeoVersions,
} from "@/lib/article-engine/articleSeo";
import { recordArticleView } from "@/lib/analytics";
import { getArticleBySlug } from "@/lib/articles";
import { getPublicArticleDate } from "@/lib/public-article";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const versions =
    await getPublicArticleSeoVersions(article.id);

  if (!versions) {
    notFound();
  }

  return createArticleMetadata({
    language: "fr",
    slug: article.slug,
    title: article.title,
    description: article.description,
    image: article.image,
    publishedAt: getPublicArticleDate(article),
    versions,
  });
}

export default async function ArticlePage({
  params,
}: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  await recordArticleView(article.id);

  const variants = await prisma.articleTranslation.findMany({
    where: { articleId: article.id, status: "PUBLISHED" },
    select: { locale: true, slug: true },
    orderBy: { locale: "asc" },
  });

  const languageVariants = [
    { locale: "fr", label: "Français", href: `/article/${article.slug}` },
    ...variants.map((variant) => ({
      locale: variant.locale.toLowerCase(),
      label: variant.locale === "CA" ? "Català" : "Español",
      href: `/${variant.locale.toLowerCase()}/article/${variant.slug}`,
    })),
  ];

  return (
    <PublicArticleView
      article={{
        ...article,
        publishedAt: getPublicArticleDate(article),
        languageVariants,
      }}
      dateLocale="fr-FR"
      contentLanguage="fr"
    />
  );
}
