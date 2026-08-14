import SafeImage from "@/components/SafeImage";
import Link from "next/link";

import { getArticlesByCategory, getFeaturedArticleByCategory } from "@/lib/articles";

export const dynamic = "force-dynamic";

export default async function ActualitePage() {
  const [items, selectedFeatured] = await Promise.all([
    getArticlesByCategory("ACTUALITÉ"),
    getFeaturedArticleByCategory("ACTUALITÉ"),
  ]);

  const featured = selectedFeatured ?? items[0];
  const remainingItems = featured
    ? items.filter((article) => article.id !== featured.id)
    : items;
  const mainArticle = remainingItems[0];
  const rightCards = remainingItems.slice(1, 5);
  const briefs = remainingItems.slice(5, 11);
  const bottomCard = remainingItems[11];
  const secondBottomCard = remainingItems[12];
  const bonASavoir = remainingItems[13];

  return (
    <main className="min-h-screen bg-black text-white">
      {/* HERO DE LA RUBRIQUE */}

      {featured && (
        <Link href={`/article/${featured.slug}`} className="block">
          <section className="relative h-[520px] overflow-hidden md:h-[620px]">
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

              <h1
                className="mt-4 h-[9.5rem] max-w-5xl overflow-hidden font-serif text-5xl leading-[1.05] md:h-[9.5rem] md:text-7xl"
                style={{
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 2,
                  overflow: "hidden",
                }}
              >
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
                  <div className="relative h-[420px] shrink-0">
                    <SafeImage
                      src={mainArticle.image}
                      alt={mainArticle.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 66vw"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <h2 className="h-[7.5rem] overflow-hidden font-serif text-5xl leading-tight line-clamp-2">
                      {mainArticle.title}
                    </h2>

                    <p className="mt-4 text-gray-400">
                      {mainArticle.description}
                    </p>

                    <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-500">
                      Lire l’article →
                    </p>
                  </div>
                </article>
              </Link>
            )}

            {/* TROIS BRÈVES */}

            {briefs.length > 0 && (
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {briefs.map((article) => (
                  <Link
                    key={article.id}
                    href={`/article/${article.slug}`}
                    className="block"
                  >
                    <article className="flex h-[190px] flex-col justify-between overflow-hidden rounded-lg border border-gray-800 p-4 transition hover:border-yellow-500">
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
                    className="block lg:h-full"
                  >
                    <article className="flex h-[560px] flex-col overflow-hidden rounded-xl border border-gray-800 transition hover:border-yellow-500">
                      <div className="relative h-[300px] shrink-0">
                        <SafeImage
                          src={bottomCard.image}
                          alt={bottomCard.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover"
                        />
                      </div>

                      <div className="p-5">
                        <h2 className="h-[4rem] overflow-hidden font-serif text-2xl leading-tight line-clamp-2">
                          {bottomCard.title}
                        </h2>

                        <p className="mt-3 h-[7rem] overflow-hidden leading-relaxed text-gray-400 line-clamp-4">
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
                    className="block lg:h-full"
                  >
                    <article className="flex h-[560px] flex-col overflow-hidden rounded-xl border border-gray-800 transition hover:border-yellow-500">
                      <div className="relative h-[300px] shrink-0">
                        <SafeImage
                          src={secondBottomCard.image}
                          alt={secondBottomCard.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover"
                        />
                      </div>

                      <div className="p-5">
                        <h2 className="h-[4rem] overflow-hidden font-serif text-2xl leading-tight line-clamp-2">
                          {secondBottomCard.title}
                        </h2>

                        <p className="mt-3 h-[7rem] overflow-hidden leading-relaxed text-gray-400 line-clamp-4">
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
          </div>

          {/* PARTIE DROITE : 2 COLONNES */}

          <aside className="space-y-6 lg:col-span-2">
            {rightCards.map((article) => (
              <Link
                key={article.id}
                href={`/article/${article.slug}`}
                className="block"
              >
                <article className="flex h-[300px] flex-col overflow-hidden rounded-xl border border-gray-800 transition hover:border-yellow-500">
                  <div className="relative h-40 shrink-0">
                    <SafeImage
                      src={article.image}
                      alt={article.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>

                  <div className="p-4">
                    <h3 className="h-[3.5rem] overflow-hidden font-serif text-xl leading-tight line-clamp-2">
                      {article.title}
                    </h3>

                    <p className="mt-2 h-[3.5rem] overflow-hidden leading-relaxed text-gray-400 line-clamp-2">
                      {article.description}
                    </p>

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
                className="block"
              >
                <article className="flex h-[560px] flex-col overflow-hidden rounded-xl border-t-2 border-yellow-500 bg-zinc-900 p-6 transition hover:bg-zinc-800">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-500">
                    Bon à savoir
                  </p>

                  <h2 className="mt-4 font-serif text-2xl leading-snug">
                    {bonASavoir.title}
                  </h2>

                  <p className="mt-4 line-clamp-4 flex-1 leading-relaxed text-gray-400">
                    {bonASavoir.description}
                  </p>

                  <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-500">
                    Lire l’article →
                  </p>
                </article>
              </Link>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
