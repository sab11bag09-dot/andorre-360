import SafeImage from "@/components/SafeImage";
import Link from "next/link";

import { getArticlesByCategory } from "@/lib/articles";

export const dynamic = "force-dynamic";

export default async function EconomiePageV2() {
  const items = await getArticlesByCategory("ÉCONOMIE");

  const featured = items[0];
  const mainArticle = items[1];
  const questionArticle = items[2];
  const rightCards = items.slice(3, 4);
  const briefs = items.slice(6, 12);
  const bottomCard = items[12];
  const secondBottomCard = items[13];
  const bonASavoir = items[14];
  const bonASavoirBriefs = items.slice(15, 20);

  return (
    <main className="min-h-screen bg-black text-white">
      {/* HERO DE LA RUBRIQUE */}

      {featured && (
        <Link href={`/article/${featured.slug}`} className="block">
          <section className="relative h-[60vh] min-h-[480px] overflow-hidden">
            <SafeImage
              src={featured.image}
              alt={featured.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

            <div className="absolute bottom-10 left-8 max-w-3xl">
              <p className="text-sm uppercase tracking-widest text-yellow-500">
                {featured.category}
              </p>

              <h1 className="mt-4 h-[10rem] overflow-hidden font-serif text-5xl leading-7 md:text-7xl md:leading-[1.05] line-clamp-2">
                {featured.title}
              </h1>

              <p className="mt-4 h-14 overflow-hidden text-gray-300 leading-7 line-clamp-2">
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
                <article className="flex h-[700px] flex-col overflow-hidden rounded-xl border border-gray-800 transition hover:border-yellow-500">
                  <div className="relative h-[430px] shrink-0">
                    <SafeImage
                      src={mainArticle.image}
                      alt={mainArticle.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 66vw"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex flex-1 flex-col overflow-hidden p-6">
                    <h2 className="h-[5.5rem] overflow-hidden font-serif text-4xl leading-tight line-clamp-2">
                      {mainArticle.title}
                    </h2>

                    <p className="mt-4 h-14 overflow-hidden text-gray-400 leading-7 line-clamp-2">
                      {mainArticle.description}
                    </p>

                    <p className="mt-auto pt-5 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-500">
                      Lire l’article →
                    </p>
                  </div>
                </article>
              </Link>
            )}

            {/* SIX BRÈVES */}

            {briefs.length > 0 && (
              <div className="mt-8 grid h-[270px] gap-4 overflow-hidden md:grid-cols-3">
                {briefs.map((article) => (
                  <Link
                    key={article.id}
                    href={`/article/${article.slug}`}
                    className="block"
                  >
                    <article className="flex h-full flex-col justify-between rounded-lg border border-gray-800 p-4 transition hover:border-yellow-500">
                      <h3 className="font-serif text-lg leading-snug">
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
              <div className="mt-10 grid h-[540px] gap-8 overflow-hidden md:grid-cols-2">
                {bottomCard && (
                  <Link
                    href={`/article/${bottomCard.slug}`}
                    className="block lg:h-full"
                  >
                    <article className="h-full overflow-hidden rounded-xl border border-gray-800 transition hover:border-yellow-500 lg:flex lg:flex-col">
                      <div className="relative h-64 shrink-0">
                        <SafeImage
                          src={bottomCard.image}
                          alt={bottomCard.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover"
                        />
                      </div>

                      <div className="p-5">
                        <h2 className="h-14 overflow-hidden font-serif text-2xl leading-7 line-clamp-2">
                          {bottomCard.title}
                        </h2>

                        <p className="mt-3 h-10 overflow-hidden text-sm leading-5 text-gray-400 line-clamp-2">
                          {bottomCard.description}
                        </p>

                        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-500">
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
                      <div className="relative h-64 shrink-0">
                        <SafeImage
                          src={secondBottomCard.image}
                          alt={secondBottomCard.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover"
                        />
                      </div>

                      <div className="p-5">
                        <h2 className="h-14 overflow-hidden font-serif text-2xl leading-7 line-clamp-2">
                          {secondBottomCard.title}
                        </h2>

                        <p className="mt-3 h-10 overflow-hidden text-sm leading-5 text-gray-400 line-clamp-2">
                          {secondBottomCard.description}
                        </p>

                        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-500">
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

          <aside className="flex h-full flex-col gap-6 lg:col-span-2">
            {/* QUESTION À... */}

            {questionArticle && (
              <Link
                href={`/article/${questionArticle.slug}`}
                className="block"
              >
                <article className="flex h-[620px] flex-col overflow-hidden rounded-xl border border-gray-800 transition hover:border-yellow-500">
                  <div className="relative h-[226px]">
                    <SafeImage
                      src={questionArticle.image}
                      alt={questionArticle.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex flex-1 flex-col overflow-hidden p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-500">
                      Question à…
                    </p>

                    <h2 className="mt-3 line-clamp-3 font-serif text-2xl leading-snug">
                      {questionArticle.title}
                    </h2>

                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-gray-400">
                      {questionArticle.description}
                    </p>

                    <p className="mt-auto pt-4 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-500">
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
                <article className="flex h-[360px] flex-col overflow-hidden rounded-xl border border-gray-800 transition hover:border-yellow-500">
                  {index < rightCards.length - 1 && (
                    <div className="relative h-[226px]">
                      <SafeImage
                        src={article.image}
                        alt={article.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="mt-auto p-4">
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
              <div className="mt-auto">
                <article className="flex h-[540px] flex-col overflow-hidden rounded-xl border-t-2 border-yellow-500 bg-zinc-900 p-6">
                  <Link
                    href={`/article/${bonASavoir.slug}`}
                    className="block transition hover:text-yellow-500"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-500">
                      Bon à savoir
                    </p>

                    <h2 className="mt-4 line-clamp-3 font-serif text-2xl leading-snug">
                      {bonASavoir.title}
                    </h2>

                    <p className="mt-4 line-clamp-3 leading-relaxed text-gray-400">
                      {bonASavoir.description}
                    </p>

                    <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-500">
                      Lire l’article →
                    </p>
                  </Link>

                  <div className="mt-auto max-h-[230px] overflow-hidden divide-y divide-zinc-700 border-t border-zinc-700">
                    {bonASavoirBriefs.map((article) => (
                      <Link
                        key={article.id}
                        href={`/article/${article.slug}`}
                        className="block py-3 first:pt-4 transition hover:text-yellow-500"
                      >
                        <p className="line-clamp-2 font-serif text-base leading-snug">
                          {article.title}
                        </p>
                      </Link>
                    ))}
                  </div>
                </article>
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
