import SafeImage from "@/components/SafeImage";
import Link from "next/link";

import { getArticlesByCategory } from "@/lib/articles";

export const dynamic = "force-dynamic";

export default async function SportsPageV2() {
  const items = await getArticlesByCategory("SPORTS");

  const featured = items[0];
  const mainArticle = items[1];
  const questionArticle = items[2];
  const rightCards = items.slice(3, 6);
  const briefs = items.slice(6, 12);
  const bottomCard = items[12];
  const secondBottomCard = items[13];
  const bonASavoir = items[14];
  const fallbackImage = items.find((item) => item.image)?.image ?? "";

  return (
    <main className="min-h-screen bg-black text-white">
      {/* HERO DE LA RUBRIQUE */}

      {featured && (
        <Link href={`/article/${featured.slug}`} className="block">
          <section className="relative h-[560px] min-h-[560px] overflow-hidden">
            {(featured.image || fallbackImage) ? (
              <SafeImage
                src={featured.image || fallbackImage}
                alt={featured.title}
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            ) : null}

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

            <div className="absolute bottom-10 left-8 max-w-3xl">
              <p className="text-sm uppercase tracking-widest text-yellow-500">
                {featured.category}
              </p>

              <h1 className="mt-4 font-serif text-4xl md:text-5xl">
                {featured.title}
              </h1>

              <p className="mt-4 text-gray-300">
                {featured.description}
              </p>

              <p className="mt-5 text-sm font-semibold uppercase tracking-widest text-yellow-500">
                Lire l’article →
              </p>
            </div>
          </section>
        </Link>
      )}

      <section className="mx-auto max-w-7xl px-6 py-10 md:px-8">
        <div className="grid gap-8 lg:grid-cols-6">
          {/* PARTIE GAUCHE : 4 COLONNES */}

          <div className="lg:col-span-4 lg:flex lg:flex-col">
            {/* ARTICLE PRINCIPAL */}

            {mainArticle && (
              <Link href={`/article/${mainArticle.slug}`} className="block">
                <article className="h-[620px] overflow-hidden rounded-xl border border-gray-800 transition hover:border-yellow-500">
                  {(mainArticle.image || fallbackImage) ? (
                    <div className="relative h-[420px]">
                      <SafeImage
                        src={mainArticle.image || fallbackImage}
                        alt={mainArticle.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 66vw"
                        className="object-cover"
                      />
                    </div>
                  ) : null}

                  <div className="p-6">
                    <h2 className="line-clamp-2 font-serif text-3xl">
                      {mainArticle.title}
                    </h2>

                    <p className="mt-4 line-clamp-4 text-gray-400">
                      {mainArticle.description}
                    </p>

                    <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-500">
                      Lire l’article →
                    </p>
                  </div>
                </article>
              </Link>
            )}

            {/* SIX BRÈVES */}

            {briefs.length > 0 && (
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {briefs.map((article) => (
                  <Link
                    key={article.id}
                    href={`/article/${article.slug}`}
                    className="block"
                  >
                    <article className="flex h-[170px] flex-col justify-between overflow-hidden rounded-lg border border-gray-800 p-4 transition hover:border-yellow-500">
                      <h3 className="line-clamp-2 font-serif text-lg leading-snug">
                        {article.title}
                      </h3>

                      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-500">
                        Lire l’article →
                      </p>
                    </article>
                  </Link>
                ))}
              </div>
            )}

            {/* DEUX PAPIERS DE PIED SUR LES 4 COLONNES */}

            {(bottomCard || secondBottomCard) && (
              <div className="mt-10 grid gap-8 md:grid-cols-2 lg:flex-1">
                {bottomCard && (
                  <Link
                    href={`/article/${bottomCard.slug}`}
                    className="block lg:h-[400px]"
                  >
                    <article className="h-[400px] overflow-hidden rounded-xl border border-gray-800 transition hover:border-yellow-500 lg:flex lg:flex-col">
                      {(bottomCard.image || fallbackImage) ? (
                        <div className="relative h-64 lg:h-auto lg:min-h-64 lg:flex-1">
                          <SafeImage
                            src={bottomCard.image || fallbackImage}
                            alt={bottomCard.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover"
                          />
                        </div>
                      ) : null}

                      <div className="p-5">
                        <h2 className="font-serif text-2xl">
                          {bottomCard.title}
                        </h2>

                        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-500">
                          Lire l’article →
                        </p>
                      </div>
                    </article>
                  </Link>
                )}

                {secondBottomCard && (
                  <Link
                    href={`/article/${secondBottomCard.slug}`}
                    className="block lg:h-full"
                  >
                    <article className="h-full overflow-hidden rounded-xl border border-gray-800 transition hover:border-yellow-500 lg:flex lg:flex-col">
                      {(secondBottomCard.image || fallbackImage) ? (
                        <div className="relative h-64 lg:h-auto lg:min-h-64 lg:flex-1">
                          <SafeImage
                            src={secondBottomCard.image || fallbackImage}
                            alt={secondBottomCard.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover"
                          />
                        </div>
                      ) : null}

                      <div className="p-5">
                        <h2 className="font-serif text-2xl">
                          {secondBottomCard.title}
                        </h2>

                        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-500">
                          Lire l’article →
                        </p>
                      </div>
                    </article>
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* PARTIE DROITE : 2 COLONNES */}

          <aside className="space-y-6 lg:col-span-2">
            {/* QUESTION À... */}

            {questionArticle && (
              <Link
                href={`/article/${questionArticle.slug}`}
                className="block"
              >
                <article className="h-[560px] overflow-hidden rounded-xl border border-gray-800 transition hover:border-yellow-500">
                  {(questionArticle.image || fallbackImage) ? (
                    <div className="relative h-80">
                      <SafeImage
                        src={questionArticle.image || fallbackImage}
                        alt={questionArticle.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  ) : null}

                  <div className="p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-500">
                      Question à…
                    </p>

                    <h2 className="mt-3 line-clamp-2 font-serif text-2xl leading-snug">
                      {questionArticle.title}
                    </h2>

                    <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-gray-400">
                      {questionArticle.description}
                    </p>

                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-500">
                      Lire l’entretien →
                    </p>
                  </div>
                </article>
              </Link>
            )}

            {/* TROIS CARTES CLASSIQUES */}

            {rightCards.map((article) => (
              <Link
                key={article.id}
                href={`/article/${article.slug}`}
                className="block"
              >
                <article className="h-[300px] overflow-hidden rounded-xl border border-gray-800 transition hover:border-yellow-500">
                  {article.image ? (
                    <div className="relative h-40">
                      <SafeImage
                        src={article.image}
                        alt={article.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  ) : null}

                  <div className="p-4">
                    <h3 className="line-clamp-2 font-serif text-lg leading-snug">
                      {article.title}
                    </h3>

                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-500">
                      Lire l’article →
                    </p>
                  </div>
                </article>
              </Link>
            ))}

            {/* BON À SAVOIR */}

            {bonASavoir && (
              <Link
                href={`/article/${bonASavoir.slug}`}
                className="block mt-14 lg:h-[400px]"
              >
                <article className="h-[400px] overflow-hidden rounded-xl border-t-2 border-yellow-500 bg-zinc-900 transition hover:bg-zinc-800">
                  {(bonASavoir.image || fallbackImage) ? (
                    <div className="relative h-48">
                      <SafeImage
                        src={bonASavoir.image || fallbackImage}
                        alt={bonASavoir.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  ) : null}

                  <div className="p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-500">
                      Bon à savoir
                    </p>

                  <h2 className="mt-4 line-clamp-2 font-serif text-2xl leading-snug">
                    {bonASavoir.title}
                  </h2>

                  <p className="mt-4 line-clamp-4 leading-relaxed text-gray-400">
                    {bonASavoir.description}
                  </p>

                  <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-500">
                    Lire l’article →
                  </p>
                  </div>
                </article>
              </Link>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
