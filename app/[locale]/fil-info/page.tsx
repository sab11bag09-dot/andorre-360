import type { Metadata } from "next";
import { notFound } from "next/navigation";

import FilInfoPagination from "@/components/fil-info/FilInfoPagination";
import FilInfoTimeline from "@/components/fil-info/FilInfoTimeline";
import { FIL_INFO_QUERY_LIMIT, getArticlePublicationDate } from "@/lib/fil-info";
import { normalizeFilInfoFormat } from "@/lib/fil-info-format";
import {
  getFilInfoPath,
  isTranslatedFilInfoLocale,
} from "@/lib/fil-info-locale";
import { getTranslatedFilInfoArticles } from "@/lib/fil-info-localized";
import { createFilInfoCursor } from "@/lib/fil-info-pagination";

export const dynamic = "force-dynamic";

const copy = {
  ca: {
    title: "Fil informatiu — L’actualitat d’Andorra en directe",
    description: "Seguiu les últimes notícies, alertes i articles publicats per Andorra 360.",
    heading: "L’actualitat en directe",
    intro: "Les últimes publicacions, ordenades segons l’hora de publicació.",
  },
  es: {
    title: "Hilo informativo — La actualidad de Andorra en directo",
    description: "Siga las últimas noticias, alertas y artículos publicados por Andorra 360.",
    heading: "La actualidad en directo",
    intro: "Las últimas publicaciones, ordenadas según su hora de publicación.",
  },
} as const;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isTranslatedFilInfoLocale(locale)) return {};
  const canonical = getFilInfoPath(locale);
  const [ca, es] = await Promise.all([
    getTranslatedFilInfoArticles("ca", { limit: 1 }),
    getTranslatedFilInfoArticles("es", { limit: 1 }),
  ]);
  const languages: Record<string, string> = { fr: "/fil-info", "x-default": "/fil-info" };
  if (ca.length) languages.ca = "/ca/fil-info";
  if (es.length) languages.es = "/es/fil-info";
  return {
    title: copy[locale].title,
    description: copy[locale].description,
    alternates: { canonical, languages },
    openGraph: { title: copy[locale].title, description: copy[locale].description, type: "website", url: canonical },
  };
}

export default async function LocalizedFilInfoPage({ params }: Props) {
  const { locale } = await params;
  if (!isTranslatedFilInfoLocale(locale)) notFound();
  const items = await getTranslatedFilInfoArticles(locale, { limit: FIL_INFO_QUERY_LIMIT + 1 });
  const hasMore = items.length > FIL_INFO_QUERY_LIMIT;
  const visibleItems = items.slice(0, FIL_INFO_QUERY_LIMIT);
  const entries = visibleItems.map((article) => ({
    id: article.id,
    slug: article.slug,
    title: article.title,
    description: article.description,
    filInfoFormat: normalizeFilInfoFormat(article.filInfoFormat),
    publicationDate: getArticlePublicationDate(article),
  }));
  const oldest = visibleItems.at(-1);
  const latest = visibleItems.find((article) => !article.filInfoPinned);

  return (
    <main className="min-h-screen bg-black text-white" lang={locale}>
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 md:px-10 md:py-16">
        <header className="mb-10 border-b border-gray-800 pb-9 md:mb-14">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-yellow-500">Andorra 360</p>
          <div className="mt-3 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <h1 className="max-w-4xl font-serif text-4xl leading-[0.95] tracking-[-0.025em] sm:text-5xl md:text-6xl">{copy[locale].heading}</h1>
            <p className="max-w-md text-base leading-8 text-gray-300 md:text-right md:text-lg">{copy[locale].intro}</p>
          </div>
        </header>
        <FilInfoTimeline entries={entries} locale={locale} />
        <FilInfoPagination
          initialCursor={oldest ? createFilInfoCursor(oldest) : null}
          latestCursor={latest ? createFilInfoCursor(latest) : null}
          initialHasMore={hasMore}
          locale={locale}
        />
      </section>
    </main>
  );
}
