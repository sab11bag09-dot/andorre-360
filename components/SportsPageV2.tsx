import SafeImage from "@/components/SafeImage";
import Link from "next/link";

import { getArticlesByCategory } from "@/lib/articles";

export const dynamic = "force-dynamic";

export default async function SportsPageV2() {
  const items = await getArticlesByCategory("SPORTS");

  const featured = items[0];
  const mainArticle = items[1];
  const questionArticle = items[2];
  const rightCards = items.slice(3, 6).filter((article) => article.title?.trim());
  const briefs = items.slice(6, 12);
  const bottomCard = items[12];
  const secondBottomCard = items[13];
  const footerCards = items.slice(12, 16);
  const footerSideCards = items.slice(16, 18);
  const footerSideFeature = items[18];
  const footerHorizontalFeature = items[19];
  const skiBrief = items[20];
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

            {/* QUATRE CARTES DE PIED */}

            {footerCards.length > 0 && (
              <div className="mt-10 grid gap-6 md:grid-cols-2">
                {footerCards.map((article, index) => (
                  <Link
                    key={article.id}
                    href={`/article/${article.slug}`}
                    className={index >= 2 ? "block h-[460px]" : "block h-[400px]"}
                  >
                    <article className={index >= 2 ? "h-[460px] overflow-hidden rounded-xl border border-gray-800 transition hover:border-yellow-500" : "h-[400px] overflow-hidden rounded-xl border border-gray-800 transition hover:border-yellow-500"}>
                      {(article.image || fallbackImage) ? (
                        <div className="relative h-56">
                          <SafeImage
                            src={article.image || fallbackImage}
                            alt={article.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover"
                          />
                        </div>
                      ) : null}

                      <div className="p-5">
                        <h2 className="line-clamp-2 font-serif text-2xl">
                          {article.title}
                        </h2>

                        <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-gray-400">
                          {article.description}
                        </p>

                        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-500">
                          Lire l’article →
                        </p>
                      </div>
                    </article>
                  </Link>
                ))}
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
                <article className="overflow-hidden rounded-xl border border-gray-800 transition hover:border-yellow-500">
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

            {rightCards.map((article, index) => (
              <Link
                key={article.id}
                href={`/article/${article.slug}`}
                className="block"
              >
                <article className={index === rightCards.length - 1 ? "h-[460px] overflow-hidden rounded-xl border border-gray-800 transition hover:border-yellow-500" : "overflow-hidden rounded-xl border border-gray-800 transition hover:border-yellow-500"}>
                  {index !== rightCards.length - 1 && article.image ? (
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

            {skiBrief && (
              <Link
                href={`/article/${skiBrief.slug}`}
                className="block"
              >
                <article className="h-[150px] overflow-hidden rounded-xl border border-gray-800 p-5 transition hover:border-yellow-500">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-500">
                    Sports
                  </p>
                  <h3 className="mt-3 line-clamp-2 font-serif text-lg leading-snug">
                    {skiBrief.title}
                  </h3>
                </article>
              </Link>
            )}

            {/* DEUX CARTES DE PIED À DROITE */}

            {footerSideCards.length > 0 && (
              <div className="space-y-6">
                {footerSideCards.map((article) => (
                  <Link
                    key={article.id}
                    href={`/article/${article.slug}`}
                    className="block"
                  >
                    <article className="h-[190px] overflow-hidden rounded-xl border border-gray-800 p-5 transition hover:border-yellow-500">
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-500">
                        Sports
                      </p>

                      <h2 className="mt-4 line-clamp-2 font-serif text-2xl leading-snug">
                        {article.title}
                      </h2>

                      <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-gray-400">
                        {article.description}
                      </p>
                    </article>
                  </Link>
                ))}
              </div>
            )}

          </aside>

        <div className="mt-10 grid items-stretch gap-8 lg:grid-cols-6">
          <div className="lg:col-span-4">
{footerHorizontalFeature && (
              <Link
                href={`/article/${footerHorizontalFeature.slug}`}
                className="block h-[400px]"
              >
                <article className="grid h-[400px] grid-cols-2 overflow-hidden rounded-xl border border-gray-800 transition hover:border-yellow-500">
                  {(footerHorizontalFeature.image || fallbackImage) ? (
                    <div className="relative">
                      <SafeImage
                        src={footerHorizontalFeature.image || fallbackImage}
                        alt={footerHorizontalFeature.title}
                        fill
                        sizes="(max-width: 1024px) 50vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="bg-zinc-900" />
                  )}

                  <div className="flex flex-col justify-between p-6">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-500">
                        Sports
                      </p>
                      <h2 className="mt-4 line-clamp-2 font-serif text-2xl">
                        {footerHorizontalFeature.title}
                      </h2>
                      <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-gray-400">
                        {footerHorizontalFeature.description}
                      </p>
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-500">
                      Lire l’article →
                    </p>
                  </div>
                </article>
              </Link>
            )}
          </div>
          <div className="lg:col-span-2">
{footerSideFeature && (
              <Link
                href={`/article/${footerSideFeature.slug}`}
                className="block h-[400px]"
              >
                <article className="h-[400px] overflow-hidden rounded-xl border border-gray-800 transition hover:border-yellow-500">
                  {(footerSideFeature.image || fallbackImage) ? (
                    <div className="relative h-56">
                      <SafeImage
                        src={footerSideFeature.image || fallbackImage}
                        alt={footerSideFeature.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  ) : null}

                  <div className="p-5">
                    <h2 className="line-clamp-2 font-serif text-2xl">
                      {footerSideFeature.title}
                    </h2>
                    <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-gray-400">
                      {footerSideFeature.description}
                    </p>
                  </div>
                </article>
              </Link>
            )}
          </div>
        </div>
        </div>
      </section>
    </main>
  );
}
