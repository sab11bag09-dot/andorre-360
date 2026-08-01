import type { Metadata } from "next";
import { notFound } from "next/navigation";

import PublicArticleView from "@/components/article/PublicArticleView";
import { Button } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

function isTranslationLocale(
  locale: string,
): locale is "CA" | "ES" {
  return locale === "CA" || locale === "ES";
}

export default async function TranslationPreviewPage({
  params,
}: {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}) {
  await requireAdmin();

  const { id, locale } = await params;
  const articleId = Number(id);

  if (
    !Number.isInteger(articleId) ||
    articleId <= 0 ||
    !isTranslationLocale(locale)
  ) {
    notFound();
  }

  const translation =
    await prisma.articleTranslation.findUnique({
      where: {
        articleId_locale: {
          articleId,
          locale,
        },
      },
      include: {
        article: {
          select: {
            category: true,
            image: true,
            author: true,
            readingTime: true,
            videoUrl: true,
          },
        },
      },
    });

  if (!translation) {
    notFound();
  }

  const contentLanguage = locale === "CA" ? "ca" : "es";

  return (
    <>
      <div className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-3 border-b border-yellow-800 bg-yellow-950 px-5 py-3 text-yellow-100">
        <p className="text-sm font-semibold">
          Aperçu administrateur · {translation.status}
        </p>
        <Button
          href={`/admin/articles/${articleId}/translations/${locale}`}
          variant="outline"
        >
          Retour à l’édition
        </Button>
      </div>

      <PublicArticleView
        article={{
          title: translation.title,
          description: translation.description,
          content: translation.content,
          category: translation.article.category,
          image: translation.article.image.trim() || null,
          author: translation.article.author,
          readingTime: translation.article.readingTime,
          videoUrl: translation.article.videoUrl,
          publishedAt:
            translation.publishedAt ?? translation.updatedAt,
        }}
        dateLocale={locale === "CA" ? "ca-ES" : "es-ES"}
        contentLanguage={contentLanguage}
      />
    </>
  );
}
