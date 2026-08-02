import SafeImage from "@/components/SafeImage";
import FilInfoTimeline from "@/components/fil-info/FilInfoTimeline";
import Link from "next/link";

import { getArticlesByCategory } from "@/lib/articles";
import {
  FIL_INFO_QUERY_LIMIT,
  getArticlePublicationDate,
  partitionFilInfoArticles,
} from "@/lib/fil-info";

export const dynamic = "force-dynamic";

export default async function FilInfoPage() {
  const items = await getArticlesByCategory("ACTUALITÉ", {
    limit: FIL_INFO_QUERY_LIMIT,
  });

  const {
    featured,
    briefs,
    cards,
    illustratedBriefs,
    newsFeed,
  } = partitionFilInfoArticles(items);
  const newsFeedEntries = newsFeed.map((article) => ({
    id: article.id,
    slug: article.slug,
    title: article.title,
    publicationDate: getArticlePublicationDate(article),
  }));

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 md:px-10 md:py-16">
        <header className="mb-10 border-b border-gray-800 pb-9 md:mb-14">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-yellow-500">
                Andorre 360
              </p>

              <h1 className="mt-3 max-w-4xl font-serif text-4xl leading-[0.95] tracking-[-0.025em] sm:text-5xl md:text-6xl">
                L’actualité en continu
              </h1>
            </div>

            <p className="max-w-md text-base leading-8 text-gray-300 md:text-right md:text-lg">
              Les dernières publications, classées selon leur heure de mise en
              ligne.
            </p>
          </div>
        </header>

        <div
          className={
            featured
              ? "grid items-stretch gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)] xl:gap-14"
              : ""
          }
        >
          <FilInfoTimeline entries={newsFeedEntries} />

          {featured && (
            <aside
              aria-labelledby="fil-info-selection-title"
              className="flex h-full flex-col"
            >
              <div className="mb-5 flex items-center gap-4 border-t-2 border-yellow-500 pt-4">
                <h2
                  id="fil-info-selection-title"
                  className="font-serif text-3xl"
                >
                  La sélection
                </h2>
              </div>

              <Link
                href={`/article/${featured.slug}`}
                className="group flex flex-1"
              >
                <article className="flex w-full flex-col">
                  <div className="relative aspect-[4/5] min-h-[420px] overflow-hidden bg-neutral-900 sm:aspect-[16/11] lg:aspect-auto lg:min-h-0 lg:flex-1">
                    <SafeImage
                      src={featured.image}
                      alt={featured.title}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 34vw"
                      className="object-cover transition duration-700 ease-out group-hover:scale-[1.025]"
                    />

                    <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  </div>

                  <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.24em] text-yellow-500">
                    Actualité
                  </p>

                  <h3 className="mt-3 font-serif text-3xl leading-[1.08] tracking-[-0.02em] transition-colors duration-300 group-hover:text-yellow-500">
                    {featured.title}
                  </h3>

                  <p className="mt-4 line-clamp-3 text-sm leading-7 text-gray-400">
                    {featured.description}
                  </p>

                  <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.21em] text-gray-500 transition group-hover:text-yellow-500">
                    Lire l’article →
                  </p>
                </article>
              </Link>
            </aside>
          )}
        </div>

        {briefs.length > 0 && (
          <section
            aria-labelledby="fil-info-briefs-title"
            className="mt-16 md:mt-20"
          >
            <div className="mb-7 flex items-end justify-between gap-6 border-t border-gray-800 pt-5">
              <h2 id="fil-info-briefs-title" className="font-serif text-3xl">
                Dernières actualités
              </h2>

              <p className="hidden text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600 sm:block">
                La suite du fil
              </p>
            </div>

            <div className="grid border-b border-gray-800 md:grid-cols-3">
              {briefs.map((article, index) => (
                <Link
                  key={article.id}
                  href={`/article/${article.slug}`}
                  className={`group block border-t border-gray-800 ${
                    index % 3 !== 0
                      ? "md:border-l md:border-gray-800 md:pl-7"
                      : ""
                  } ${index % 3 !== 2 ? "md:pr-7" : ""}`}
                >
                  <article className="flex h-full min-h-48 flex-col justify-between py-8">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-serif text-2xl text-yellow-500">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <span aria-hidden="true" className="h-px flex-1 bg-gray-800" />
                      </div>

                      <h3 className="mt-5 font-serif text-xl leading-[1.22] transition-colors duration-300 group-hover:text-yellow-500">
                        {article.title}
                      </h3>
                    </div>

                    <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.21em] text-gray-500 transition group-hover:text-yellow-500">
                      Lire la brève →
                    </p>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        )}

        {(cards.length > 0 || illustratedBriefs.length > 0) && (
          <div className="mt-16 grid items-stretch gap-12 md:mt-20 lg:grid-cols-6 lg:gap-14">
            {cards.length > 0 && (
              <section
                aria-labelledby="fil-info-follow-title"
                className="flex h-full flex-col lg:col-span-4"
              >
                <div className="mb-7 border-t-2 border-yellow-500 pt-5">
                  <h2 id="fil-info-follow-title" className="font-serif text-3xl">
                    À suivre
                  </h2>
                </div>

                <div className="grid flex-1 gap-x-8 gap-y-12 md:grid-cols-2">
                  {cards.map((article) => (
                    <Link
                      key={article.id}
                      href={`/article/${article.slug}`}
                      className="group block"
                    >
                      <article className="flex h-full flex-col border-b border-gray-800 pb-8">
                        <div className="relative aspect-[16/10] overflow-hidden bg-neutral-900">
                          <SafeImage
                            src={article.image}
                            alt={article.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover transition duration-700 group-hover:scale-[1.025]"
                          />
                        </div>

                        <div className="pt-5">
                          <h3 className="font-serif text-2xl leading-[1.18] transition group-hover:text-yellow-500">
                            {article.title}
                          </h3>

                          <p className="mt-3 line-clamp-3 text-sm leading-7 text-gray-400">
                            {article.description}
                          </p>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {illustratedBriefs.length > 0 && (
              <aside
                aria-labelledby="fil-info-remember-title"
                className="h-full overflow-hidden border border-gray-800 bg-neutral-950/90 lg:col-span-2"
              >
                <div className="border-b border-gray-800 px-5 py-6">
                  <h2
                    id="fil-info-remember-title"
                    className="font-serif text-3xl leading-none"
                  >
                    À retenir
                  </h2>
                </div>

                <div className="divide-y divide-gray-800">
                  {illustratedBriefs.map((article) => (
                    <Link
                      key={article.id}
                      href={`/article/${article.slug}`}
                      className="group block px-5 py-5 transition-colors duration-300 hover:bg-white/[0.03]"
                    >
                      <article className="grid grid-cols-[112px_1fr] gap-4">
                        <div className="relative aspect-[4/3] overflow-hidden bg-neutral-900">
                          <SafeImage
                            src={article.image}
                            alt={article.title}
                            fill
                            sizes="112px"
                            className="object-cover transition duration-500 ease-out group-hover:scale-[1.04]"
                          />
                        </div>

                        <div className="flex min-w-0 flex-col justify-between">
                          <h3 className="font-serif text-[1.05rem] leading-[1.25] transition group-hover:text-yellow-500">
                            {article.title}
                          </h3>

                          <p className="mt-3 text-[9px] font-semibold uppercase tracking-[0.18em] text-gray-500 transition group-hover:text-yellow-500">
                            Lire →
                          </p>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </aside>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
