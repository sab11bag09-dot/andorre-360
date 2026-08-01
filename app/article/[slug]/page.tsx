import PublicArticleView from "@/components/article/PublicArticleView";
import { recordArticleView } from "@/lib/analytics";
import { getArticleBySlug } from "@/lib/articles";
import { notFound } from "next/navigation";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
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
    />
  );
}
