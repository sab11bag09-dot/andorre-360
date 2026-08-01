import PublicArticleView from "@/components/article/PublicArticleView";
import {
  getPublicArticleTranslation,
  isPublicTranslationLocale,
} from "@/lib/article-engine/getPublicArticleTranslation";
import { recordArticleView } from "@/lib/analytics";
import { notFound } from "next/navigation";

export default async function TranslatedArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
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
    />
  );
}
