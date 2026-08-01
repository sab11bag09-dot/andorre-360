import PublicArticleView from "@/components/article/PublicArticleView";
import {
  createArticleMetadata,
  getPublicArticleSeoVersions,
} from "@/lib/article-engine/articleSeo";
import { recordArticleView } from "@/lib/analytics";
import { getArticleBySlug } from "@/lib/articles";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article || !article.published) {
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
    publishedAt: article.createdAt,
    versions,
  });
}

export default async function ArticlePage({
  params,
}: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article || !article.published) {
    notFound();
  }

  await recordArticleView(article.id);

  return (
    <PublicArticleView
      article={{
        ...article,
        publishedAt: article.createdAt,
      }}
      dateLocale="fr-FR"
      contentLanguage="fr"
    />
  );
}
