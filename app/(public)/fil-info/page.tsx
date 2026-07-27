import SafeImage from "@/components/SafeImage";
import Link from "next/link";

import { getArticlesByCategory } from "@/lib/articles";

export const dynamic = "force-dynamic";

function formatHour(value: Date | string) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(value));
}

export default async function FilInfoPage() {
  const items = await getArticlesByCategory("ACTUALITÉ");

  const featured = items[0];
  const briefs = items.slice(1, 7);
  const cards = items.slice(7, 11);

  // La colonne de droite conserve ses tranches d'origine afin que
  // le Fil Info garde la même quantité de contenu et la même hauteur.
  const illustratedBriefs = items.slice(8, 12);
  const newsFeed = items.slice(12);

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 md:px-10 md:py-16">
        <header className="mb-14 border-b border-gray-800 pb-9">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="mt-3 max-w-4xl font-serif text-4xl leading-[0.95] tracking-[-0.025em] sm:text-5xl md:text-6xl">
                L’actualité en continu
              </h1>
            </div>

            <p className="max-w-md text-base leading-8 text-gray-300 md:text-right md:text-lg">
              Les grands sujets du moment et les dernières informations.
            </p>
          </div>
        </header>

        <div className="grid gap-14 xl:gap-16 lg:grid-cols-6">
          <div className="space-y-16 lg:col-span-4">
            {featured && (
              <Link href={`/article/${featured.slug}`} className="group block">
                <article className="overflow-hidden border-t-4 border-yellow-500">
                  <div className="pt-7">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-yellow-500">
                        Actualité
                      </p>
                    </div>

                    <h2 className="mt-5 max-w-5xl font-serif text-[2.7rem] leading-[0.96] tracking-[-0.03em] sm:text-[3.35rem] md:text-[4.4rem]">
                      {featured.title}
                    </h2>

                    <p className="mt-6 max-w-3xl text-base leading-8 text-gray-300 md:text-[1.08rem]">
                      {featured.description}
                    </p>
                  </div>

                  <div className="relative mt-9 aspect-[16/10] overflow-hidden bg-neutral-900 md:aspect-[16/8.4]">
                    <SafeImage
                      src={featured.image}
                      alt={featured.title}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 66vw"
                      className="object-cover transition duration-700 ease-out group-hover:scale-[1.025]"
                    />

                    <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                    <p className="absolute bottom-6 left-6 text-[11px] font-semibold uppercase tracking-[0.24em] text-yellow-500">
                      Lire l’article →
                    </p>
                  </div>
                </article>
              </Link>
            )}

            {briefs.length > 0 && (
              <section className="border-y border-gray-800/90">
                <div className="grid md:grid-cols-3">
                  {briefs.map((article, index) => (
                    <Link
                      key={article.id}
                      href={`/article/${article.slug}`}
                      className="group block"
                    >
                      <article
                        className={`flex h-full min-h-48 flex-col justify-between py-8 ${
                          index >= 3 ? "border-t border-gray-800" : ""
                        } ${
                          index % 3 !== 0
                            ? "md:border-l md:border-gray-800 md:pl-7"
                            : ""
                        } ${index % 3 !== 2 ? "md:pr-7" : ""}`}
                      >
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="font-serif text-2xl text-yellow-500">
                              {String(index + 1).padStart(2, "0")}
                            </span>

                            <span className="h-px flex-1 bg-gray-800" />
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

            {cards.length > 0 && (
              <section>
                <div className="mb-7 border-t-2 border-yellow-500 pt-5">
                  <h2 className="font-serif text-3xl">À suivre</h2>
                </div>

                <div className="grid gap-x-8 gap-y-12 md:grid-cols-2">
                  {cards.map((article) => (
                    <Link
                      key={article.id}
                      href={`/article/${article.slug}`}
                      className="group block"
                    >
                      <article className="flex h-full flex-col border-b border-gray-800 pb-8">
                        <div className="relative aspect-[16/10] overflow-hidden">
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
          </div>

          <aside className="space-y-10 lg:col-span-2 lg:border-l lg:border-gray-800 lg:pl-8 xl:pl-10">
           <section className="mt-10 overflow-hidden border border-gray-800 bg-neutral-950/90">
              <div className="border-b border-yellow-500/40 bg-yellow-500 px-5 py-4 text-black">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-3 w-3">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-black/30" />
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-black" />
                    </span>

                    <p className="text-xs font-black uppercase tracking-[0.3em]">
                      En direct
                    </p>
                  </div>

                  <p className="text-[9px] font-bold uppercase tracking-[0.2em]">
                    Mise à jour continue
                  </p>
                </div>
              </div>

              <div className="px-5 py-6">
                <h2 className="font-serif text-3xl leading-none">À retenir</h2>
              </div>

              <div className="divide-y divide-gray-800 border-t border-gray-800">
                {illustratedBriefs.map((article) => (
                  <Link
                    key={article.id}
                    href={`/article/${article.slug}`}
                    className="group block px-5 py-5 transition-colors duration-300 hover:bg-white/[0.03]"
                  >
                    <article className="grid grid-cols-[120px_1fr] gap-4">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <SafeImage
                          src={article.image}
                          alt={article.title}
                          fill
                          sizes="120px"
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
            </section>

            <section className="overflow-hidden border border-gray-800 bg-neutral-950/90">
              <div className="border-b border-gray-800 px-5 py-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-3xl leading-none">
                      Fil Info
                    </h2>
                  </div>

                  <div className="mt-1 h-10 w-1 bg-yellow-500" />
                </div>

                {newsFeed[0] && (
                  <p className="mt-4 text-xs capitalize text-gray-500">
                    {formatDate(newsFeed[0].updatedAt)}
                  </p>
                )}
              </div>

              {newsFeed.length > 0 ? (
                <div>
                  {newsFeed.map((article, index) => (
                    <Link
                      key={article.id}
                      href={`/article/${article.slug}`}
                      className="group grid grid-cols-[62px_1fr] gap-4 border-b border-gray-800 px-5 py-5 transition-colors duration-300 last:border-b-0 hover:bg-white/[0.04]"
                    >
                      <time
                        dateTime={new Date(article.updatedAt).toISOString()}
                        className="pt-0.5 text-sm font-black tabular-nums tracking-[-0.02em] text-yellow-500"
                      >
                        {formatHour(article.updatedAt)}
                      </time>

                      <div className="relative border-l border-gray-700/90 pl-5">
                        <span className="absolute -left-[5.5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-neutral-950 bg-yellow-500 ring-1 ring-yellow-500/40" />

                        <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-gray-600">
                          Dépêche {String(index + 1).padStart(2, "0")}
                        </p>

                        <h3 className="mt-2 font-serif text-[1.02rem] leading-[1.32] transition-colors duration-300 group-hover:text-yellow-500">
                          {article.title}
                        </h3>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="px-5 py-6 text-sm leading-7 text-gray-500">
                  Le fil se remplira automatiquement avec les prochains
                  articles publiés dans la rubrique Actualité.
                </p>
              )}
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}