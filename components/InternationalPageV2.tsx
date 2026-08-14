import SafeImage from "@/components/SafeImage";
import Link from "next/link";

import { getArticlesByCategory } from "@/lib/articles";

export const dynamic = "force-dynamic";

export default async function InternationalPageV2() {
  const items = await getArticlesByCategory("INTERNATIONAL");

  const featured = items[0];
  const mainArticle = items[1];
  const questionArticle = items[2];
  const rightCards = items.slice(3, 6);
  const briefs = items.slice(6, 12);
  const bottomCard = items[12];
  const secondBottomCard = items[13];
  const bonASavoir = items[14];
  const footerTextCards = items.slice(15, 17);
  const bonASavoirBriefs = items.slice(17, 18);

  return (
    <main className="min-h-screen bg-black text-white">
      {/* HERO DE LA RUBRIQUE */}

      {featured && (
        <Link href={`/article/${featured.slug}`} className="block">
          <section className="relative h-[560px] min-h-[560px] overflow-hidden">
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

              <h1 className="mt-4 h-[10.5rem] overflow-hidden font-serif text-5xl leading-tight line-clamp-2 md:text-7xl">
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

          <div className="lg:col-span-4">
            {/* ARTICLE PRINCIPAL */}

            {mainArticle && (
              <Link href={`/article/${mainArticle.slug}`} className="block">
                <article className="h-[620px] overflow-hidden rounded-xl border border-gray-800 transition hover:border-yellow-500">
                  <div className="relative h-[420px]">
                    <SafeImage
                      src={mainArticle.image}
                      alt={mainArticle.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 66vw"
                      className="object-cover"
                    />
                  </div>

                  <div className="p-6">
                    <h2 className="h-[6rem] overflow-hidden font-serif text-4xl leading-tight line-clamp-2">
                      {mainArticle.title}
                    </h2>

                    <p className="mt-4 h-14 overflow-hidden text-gray-400 leading-7 line-clamp-2">
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
                    <article className="flex h-[170px] flex-col justify-between rounded-lg border border-gray-800 p-4 transition hover:border-yellow-500">
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
              <div className="mt-10 grid gap-8 md:grid-cols-2">
                {bottomCard && (
                  <Link
                    href={`/article/${bottomCard.slug}`}
                    className="block"
                  >
                    <article className="h-[520px] overflow-hidden rounded-xl border border-gray-800 transition hover:border-yellow-500">
                      <div className="relative h-64">
                        <SafeImage
                          src={bottomCard.image || featured?.image || mainArticle?.image || ""}
                          alt={bottomCard.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover"
                        />
                      </div>

                      <div className="p-5">
                        <h2 className="font-serif text-2xl">
                          {bottomCard.title}
                        </h2>

                        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-gray-400">
                          {bottomCard.description}
                        </p>

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
                    className="block"
                  >
                    <article className="h-full overflow-hidden rounded-xl border border-gray-800 transition hover:border-yellow-500">
                      <div className="relative h-64">
                        <SafeImage
                          src={secondBottomCard.image || featured?.image || mainArticle?.image || ""}
                          alt={secondBottomCard.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover"
                        />
                      </div>

                      <div className="p-5">
                        <h2 className="font-serif text-2xl">
                          {secondBottomCard.title}
                        </h2>

                        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-gray-400">
                          {secondBottomCard.description}
                        </p>

                        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-500">
                          Lire l’article →
                        </p>
                      </div>
                    </article>
                  </Link>
                )}
              </div>
            )}

            {/* DEUX CARTES TEXTUELLES DE PIED */}

            {footerTextCards.length > 0 && (
              <div className="mt-8 grid gap-6 md:grid-cols-2">
                {footerTextCards.map((article) => (
                  <Link
                    key={article.id}
                    href={`/article/${article.slug}`}
                    className="block"
                  >
                    <article className="flex h-[220px] flex-col justify-between rounded-xl border border-gray-800 p-5 transition hover:border-yellow-500">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-500">
                          International
                        </p>
                        <h2 className="mt-4 line-clamp-2 font-serif text-2xl leading-snug">
                          {article.title}
                        </h2>
                        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-gray-400">
                          {article.description}
                        </p>
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-500">
                        Lire l’article →
                      </p>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* PARTIE DROITE : 2 COLONNES */}

          <aside className="space-y-6 lg:col-span-2 lg:flex lg:flex-col lg:gap-6 lg:space-y-0">
            {/* QUESTION À... */}

            {questionArticle && (
              <Link
                href={`/article/${questionArticle.slug}`}
                className="block"
              >
                <article className="h-[430px] overflow-hidden rounded-xl border border-gray-800 transition hover:border-yellow-500">
                  <div className="relative h-40">
                    <SafeImage
                      src={questionArticle.image}
                      alt={questionArticle.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>

                  <div className="p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-500">
                      Question à…
                    </p>

                    <h2 className="mt-3 font-serif text-2xl leading-snug">
                      {questionArticle.title}
                    </h2>

                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-gray-400">
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
                className={
                  index === rightCards.length - 1
                    ? "block lg:flex-1"
                    : "block"
                }
              >
                <article className="h-[300px] overflow-hidden rounded-xl border border-gray-800 transition hover:border-yellow-500 lg:flex lg:flex-col">
                  <div
                    className={`relative h-40 ${
                      index === rightCards.length - 1
                        ? "lg:h-auto lg:min-h-40 lg:flex-1"
                        : ""
                    }`}
                  >
                    <SafeImage
                      src={article.image}
                      alt={article.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>

                  <div className="p-4">
                    <h3 className="font-serif text-lg leading-snug">
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
              <div className="block">
                <article className="h-[390px] overflow-hidden rounded-xl border-t-2 border-yellow-500 bg-zinc-900 p-6 transition hover:bg-zinc-800">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-500">
                    Bon à savoir
                  </p>

                  <h2 className="mt-4 font-serif text-2xl leading-snug">
                    {bonASavoir.title}
                  </h2>

                  <p className="mt-4 line-clamp-4 leading-relaxed text-gray-400">
                    {bonASavoir.description}
                  </p>

                  {bonASavoirBriefs.length > 0 && (
                    <div className="mt-5 space-y-3 border-t border-gray-700 pt-4">
                      {bonASavoirBriefs.map((article) => (
                        <Link
                          key={article.id}
                          href={`/article/${article.slug}`}
                          className="block border-b border-gray-700 pb-3 font-serif text-base leading-snug transition hover:text-yellow-500 last:border-b-0"
                        >
                          {article.title}
                        </Link>
                      ))}
                    </div>
                  )}

                  <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-500">
                    Lire l’article →
                  </p>
                </article>
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
