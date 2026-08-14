import SafeImage from "@/components/SafeImage";
import Link from "next/link";

import { getArticlesByCategory } from "@/lib/articles";

export const dynamic = "force-dynamic";

export default async function PolitiquePageV2() {
  const items = await getArticlesByCategory("POLITIQUE");

  const featured = items[0];
  const mainArticle = items[1];
  const questionArticle = items[2];
  const rightCards = items.slice(3, 6);
  const briefs = items.slice(6, 12);
  const footerFeature = items[12];
  const bonASavoir = items[14];
  const bonASavoirBriefs = items.slice(15, 18);
  const footerCards = items.slice(0, 4);

  return (
    <main className="min-h-screen bg-black text-white">
      {/* HERO DE LA RUBRIQUE */}

      {featured && (
        <Link href={`/article/${featured.slug}`} className="block">
          <section className="relative h-[560px] overflow-hidden md:h-[640px]">
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
                <article className="flex h-[700px] flex-col overflow-hidden rounded-xl border border-gray-800 transition hover:border-yellow-500">
                  <div className="relative h-[395px] shrink-0">
                    <SafeImage
                      src={mainArticle.image}
                      alt={mainArticle.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 66vw"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex flex-1 flex-col overflow-hidden p-6">
                    <h2 className="line-clamp-2 font-serif text-3xl">
                      {mainArticle.title}
                    </h2>

                    <p className="mt-4 line-clamp-3 text-gray-400">
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
              <div className="mt-8 grid h-[330px] grid-rows-2 gap-4 overflow-hidden md:grid-cols-3">
                {briefs.map((article) => (
                  <Link
                    key={article.id}
                    href={`/article/${article.slug}`}
                    className="block"
                  >
                    <article className="flex h-[150px] flex-col justify-between overflow-hidden rounded-lg border border-gray-800 p-4 transition hover:border-yellow-500">
                      <h3 className="line-clamp-3 font-serif text-lg leading-snug">
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

            {/* BLOC DE PIED : 3 COLONNES PHOTO + 1 COLONNE TEXTE */}

            {footerFeature && (
              <Link
                href={`/article/${footerFeature.slug}`}
                className="mt-10 block"
              >
                <article className="grid h-[620px] overflow-hidden rounded-xl border border-gray-800 transition hover:border-yellow-500 md:grid-cols-4">
                  <div className="relative md:col-span-3">
                    <SafeImage
                      src={footerFeature.image}
                      alt={footerFeature.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 75vw"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex flex-col justify-between p-5">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-yellow-500">
                        {footerFeature.category}
                      </p>

                      <h2 className="mt-4 line-clamp-3 font-serif text-2xl leading-snug">
                        {footerFeature.title}
                      </h2>

                      <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-gray-400">
                        {footerFeature.description}
                      </p>
                    </div>

                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-500">
                      Lire l’article →
                    </p>
                  </div>
                </article>
              </Link>
            )}

            {/* PIED DE PAGE : QUATRE CARTES */}

            {footerCards.length > 0 && (
              <div className="mt-10 grid h-[500px] gap-5 overflow-hidden border-t border-gray-800 pt-6 md:mt-auto md:grid-cols-4">
                {footerCards.map((article) => (
                  <Link
                    key={`footer-${article.id}`}
                    href={`/article/${article.slug}`}
                    className="group block"
                  >
                    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-800 transition hover:border-yellow-500">
                      <div className="relative h-[160px] shrink-0 overflow-hidden">
                        <SafeImage
                          src={article.image}
                          alt={article.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 25vw"
                          className="object-cover transition duration-500 group-hover:scale-[1.03]"
                        />
                      </div>

                      <div className="flex flex-1 flex-col p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-yellow-500">
                          {article.category}
                        </p>

                        <h3 className="mt-3 line-clamp-3 font-serif text-lg leading-snug">
                          {article.title}
                        </h3>

                        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-gray-400">
                          {article.description}
                        </p>

                        <p className="mt-auto pt-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-yellow-500">
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

          <aside className="flex h-full flex-col gap-6 lg:col-span-2">
            {/* QUESTION À... */}

            {questionArticle && (
              <Link
                href={`/article/${questionArticle.slug}`}
                className="block"
              >
                <article className="flex h-[580px] flex-col overflow-hidden rounded-xl border border-gray-800 transition hover:border-yellow-500">
                  <div className="relative h-[226px] shrink-0">
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

            {rightCards.map((article) => (
              <Link
                key={article.id}
                href={`/article/${article.slug}`}
                className="block"
              >
                <article className="flex h-[360px] flex-col overflow-hidden rounded-xl border border-gray-800 transition hover:border-yellow-500">
                  <div className="relative h-[226px] shrink-0">
                    <SafeImage
                      src={article.image}
                      alt={article.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>

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
                <article className="flex h-[500px] flex-col overflow-hidden rounded-xl border-t-2 border-yellow-500 bg-zinc-900 p-6">
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
