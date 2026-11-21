import type { Metadata } from "next";
import type { CSSProperties } from "react";
import FilInfoTimeline from "@/components/fil-info/FilInfoTimeline";
import FilInfoPagination from "@/components/fil-info/FilInfoPagination";
import FilInfoImage from "@/components/fil-info/FilInfoImage";
import Link from "next/link";

import { getFilInfoArticles } from "@/lib/articles";
import {
  FIL_INFO_QUERY_LIMIT,
  FIL_INFO_XL_ROW_HEIGHT,
  getArticlePublicationDate,
  partitionFilInfoArticles,
} from "@/lib/fil-info";
import { createFilInfoCursor } from "@/lib/fil-info-pagination";
import {
  getFilInfoFormatLabel,
  normalizeFilInfoFormat,
} from "@/lib/fil-info-format";
import { getTranslatedFilInfoArticles } from "@/lib/fil-info-localized";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const [ca, es] = await Promise.all([
    getTranslatedFilInfoArticles("ca", { limit: 1 }),
    getTranslatedFilInfoArticles("es", { limit: 1 }),
  ]);
  const languages: Record<string, string> = { fr: "/fil-info", "x-default": "/fil-info" };
  if (ca.length) languages.ca = "/ca/fil-info";
  if (es.length) languages.es = "/es/fil-info";
  return {
    title: "Fil info — L’actualité en continu en Andorre",
    description: "Suivez les dernières actualités d’Andorre, les alertes, les brèves et les articles publiés par Andorre 360.",
    alternates: { canonical: "/fil-info", languages },
    openGraph: { title: "Fil info — Andorre 360", description: "Les dernières informations d’Andorre, classées selon leur heure de publication.", type: "website", url: "/fil-info" },
  };
}

function formatPinnedPublicationDate(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Andorra",
  }).format(value);
}

export default async function FilInfoPage() {
  const items = await getFilInfoArticles("ACTUALITÉ", {
    limit: FIL_INFO_QUERY_LIMIT + 1,
  });
  const { pinned, selection, newsFeed, rest } = partitionFilInfoArticles(items);

  // « Afficher plus » reprend après la dernière ligne du fil : les
  // publications non affichées sont toutes plus anciennes qu’elle.
  const hasMore = rest.length > 0;
  const lastFeedItem = newsFeed.at(-1);
  const latestChronologicalItem = items.find((article) => !article.filInfoPinned);
  const newsFeedEntries = newsFeed.map((article) => ({
    id: article.id,
    slug: article.slug,
    title: article.title,
    description: article.description,
    filInfoFormat: normalizeFilInfoFormat(article.filInfoFormat),
    publicationDate: getArticlePublicationDate(article),
  }));

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-6 md:px-10 md:py-12">
        <header className="mb-8 flex items-end justify-between gap-6 border-b border-gray-800 pb-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-yellow-500">
              Andorra 360 · Fil info
            </p>

            <h1 className="mt-2 font-serif text-3xl leading-tight tracking-[-0.02em] sm:text-4xl md:text-5xl">
              L’actualité en continu
            </h1>
          </div>
        </header>

        {pinned && (
          <section
            aria-labelledby="fil-info-pinned-title"
            className="mb-10 overflow-hidden border border-yellow-500 bg-yellow-500 text-black"
          >
            <div className="border-b border-black/20 px-5 py-3 text-[10px] font-black uppercase tracking-[0.3em] sm:px-7">
              Information épinglée
            </div>
            <Link
              href={`/article/${pinned.slug}`}
              className="group block px-5 py-6 transition-colors hover:bg-yellow-400 sm:px-7"
            >
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-black/60">
                {getFilInfoFormatLabel(pinned.filInfoFormat)}
              </p>
              <h2
                id="fil-info-pinned-title"
                className="mt-2 line-clamp-3 min-h-[3lh] font-serif text-2xl leading-tight sm:line-clamp-2 sm:min-h-[2lh] sm:text-3xl"
              >
                {pinned.title}
              </h2>
              {normalizeFilInfoFormat(pinned.filInfoFormat) === "BRIEF" && (
                <p
                  aria-hidden={pinned.description ? undefined : true}
                  className="mt-3 line-clamp-2 min-h-[2lh] max-w-3xl text-sm leading-6 text-black/70"
                >
                  {pinned.description}
                </p>
              )}
              <time
                dateTime={getArticlePublicationDate(pinned).toISOString()}
                className="mt-4 block text-xs font-semibold capitalize text-black/60"
              >
                {formatPinnedPublicationDate(
                  getArticlePublicationDate(pinned),
                )}
              </time>
            </Link>
          </section>
        )}

        {/* Rangée figée sur grand écran : voir FIL_INFO_XL_ROW_HEIGHT. */}
        <div
          data-layout-row="fil"
          className="grid items-stretch gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)] xl:h-[var(--fil-info-row-height)] xl:gap-14"
          style={{ "--fil-info-row-height": `${FIL_INFO_XL_ROW_HEIGHT}px` } as CSSProperties}
        >
          <FilInfoTimeline entries={newsFeedEntries} fixedRows={8} />

          <aside
            aria-labelledby="fil-info-selection-title"
            data-layout-column="selection"
            data-layout-block="selection"
            className="flex h-full flex-col"
          >
            <div className="mb-5 flex items-center gap-4 border-t-2 border-yellow-500 pt-4">
              <h2 id="fil-info-selection-title" className="font-serif text-3xl">
                La sélection
              </h2>
            </div>

            <div className="grid flex-1 gap-8 md:grid-cols-2 lg:grid-cols-1 xl:min-h-0 xl:grid-rows-4">
              {selection.map((article) => (
                <Link
                  key={article.id}
                  href={`/article/${article.slug}`}
                  className="group flex min-h-0"
                >
                  <article className="flex w-full min-h-0 flex-col overflow-hidden">
                    <div className="relative aspect-[16/10] shrink-0 overflow-hidden bg-neutral-900">
                      <FilInfoImage
                        src={article.image}
                        alt={article.title}
                        priority={article.id === selection[0]?.id}
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
                        className="object-cover transition duration-700 ease-out group-hover:scale-[1.025] motion-reduce:transition-none motion-reduce:transform-none"
                      />
                    </div>

                    <h3 className="mt-3 line-clamp-3 min-h-[3lh] font-serif text-xl leading-7 transition-colors duration-300 group-hover:text-yellow-500">
                      {article.title}
                    </h3>

                    <p className="mt-2 line-clamp-2 min-h-[2lh] text-sm leading-6 text-gray-400">
                      {article.description}
                    </p>
                  </article>
                </Link>
              ))}
            </div>
          </aside>
        </div>

        <FilInfoPagination
          initialCursor={lastFeedItem ? createFilInfoCursor(lastFeedItem) : null}
          latestCursor={
            latestChronologicalItem ? createFilInfoCursor(latestChronologicalItem) : null
          }
          initialHasMore={hasMore}
        />
      </section>
    </main>
  );
}
