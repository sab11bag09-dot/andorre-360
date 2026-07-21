import Image from "next/image";
import Link from "next/link";

import { getArticlesByCategory } from "@/lib/articles";

type CategoryPageDBProps = {
  category: string;
  title: string;
};

export default async function CategoryPageDB({
  category,
  title,
}: CategoryPageDBProps) {
  const items = await getArticlesByCategory(category);

  /*
   * Répartition éditoriale
   *
   * 0       : papier leader
   * 1       : grande carte
   * 2       : question à…
   * 3 à 4   : sélection
   * 5 à 7   : brèves
   * 8       : grand format
   * 9 à 11  : bon à savoir
   */
  const featured = items[0];
  const mainArticle = items[1];
  const questionArticle = items[2];
  const selectionArticles = items.slice(3, 5);
  const briefs = items.slice(5, 8);
  const bottomCard = items[8];
  const goodToKnow = items.slice(9, 12);

  if (!featured) {
    return (
      <main className="min-h-screen bg-black p-8 text-white">
        <h1 className="font-serif text-4xl">
          Aucun article dans la rubrique {title}
        </h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* PAPIER LEADER */}

      <Link href={`/article/${featured.slug}`} className="block">
        <section className="relative h-[60vh] min-h-[500px] overflow-hidden">
          <Image
            src={featured.image}
            alt={featured.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-6 pb-12 md:px-10 md:pb-16">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-500">
              {title}
            </p>

            <h1 className="mt-4 max-w-4xl font-serif text-4xl leading-tight md:text-5xl lg:text-6xl">
              {featured.title}
            </h1>

            <p className="mt-5 max-w-2xl leading-relaxed text-gray-200 md:text-lg">
              {featured.description}
            </p>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.25em] text-yellow-500">
              Lire l’article →
            </p>
          </div>
        </section>
      </Link>

      {/* GRILLE ÉDITORIALE :
          chaque rangée contient son bloc gauche et son bloc droit.
          Les deux colonnes ne se prolongent donc plus indépendamment. */}

      <section className="mx-auto max-w-7xl px-6 py-10 md:px-10 md:py-14">
        <div className="grid gap-x-10 gap-y-10 lg:grid-cols-6">
          {/* RANGÉE 1 — GRANDE CARTE */}

          {mainArticle && (
            <Link
              href={`/article/${mainArticle.slug}`}
              className="group block lg:col-span-4"
            >
              <article className="h-full overflow-hidden rounded-xl border border-gray-800 transition hover:border-yellow-500">
                <div className="relative h-[300px] md:h-[420px]">
                  <Image
                    src={mainArticle.image}
                    alt={mainArticle.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.02]"
                  />
                </div>

                <div className="p-6 md:p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-500">
                    Grande carte
                  </p>

                  <h2 className="mt-4 font-serif text-3xl leading-tight md:text-4xl">
                    {mainArticle.title}
                  </h2>

                  <p className="mt-4 max-w-3xl leading-relaxed text-gray-300">
                    {mainArticle.description}
                  </p>

                  <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-yellow-500">
                    Lire l’article →
                  </p>
                </div>
              </article>
            </Link>
          )}

          {/* RANGÉE 1 — QUESTION À… */}

          <aside className="lg:col-span-2 lg:border-l lg:border-gray-800 lg:pl-8">
            {questionArticle && (
              <Link
                href={`/article/${questionArticle.slug}`}
                className="group block"
              >
                <article className="overflow-hidden rounded-xl border border-gray-800 transition hover:border-yellow-500">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={questionArticle.image}
                      alt={questionArticle.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  </div>

                  <div className="p-6">
                    <div className="mb-4 h-px w-16 bg-yellow-500" />

                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-500">
                      Question à…
                    </p>

                    <h2 className="mt-3 font-serif text-2xl leading-tight">
                      {questionArticle.title}
                    </h2>

                    <p className="mt-4 leading-relaxed text-gray-300">
                      {questionArticle.description}
                    </p>

                    <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-500">
                      Lire l’entretien →
                    </p>
                  </div>
                </article>
              </Link>
            )}
          </aside>

          {/* RANGÉE 2 — L’ESSENTIEL */}

          <section className="lg:col-span-4">
            {briefs.length > 0 && (
              <>
                <div className="mb-5">
                  <div className="mb-3 h-px w-16 bg-yellow-500" />
                  <h2 className="font-serif text-2xl">L’essentiel</h2>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {briefs.map((article) => (
                    <Link
                      key={article.id}
                      href={`/article/${article.slug}`}
                      className="group block"
                    >
                      <article className="h-full rounded-lg border border-gray-800 p-5 transition hover:border-yellow-500">
                        <h3 className="font-serif text-lg leading-snug transition group-hover:text-yellow-500">
                          {article.title}
                        </h3>

                        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-500">
                          Lire →
                        </p>
                      </article>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </section>

          {/* RANGÉE 2 — SÉLECTION */}

          <aside className="lg:col-span-2 lg:border-l lg:border-gray-800 lg:pl-8">
            {selectionArticles.length > 0 && (
              <section>
                <div className="mb-5 border-b border-yellow-500 pb-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-500">
                    La rédaction
                  </p>
                  <h2 className="mt-1 font-serif text-2xl">Sélection</h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {selectionArticles.map((article, index) => (
                    <Link
                      key={article.id}
                      href={`/article/${article.slug}`}
                      className="group block"
                    >
                      <article className="h-full">
                        <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                          <Image
                            src={article.image}
                            alt={article.title}
                            fill
                            sizes="(max-width: 1024px) 50vw, 16vw"
                            className="object-cover transition duration-500 group-hover:scale-[1.03]"
                          />
                        </div>

                        <div className="mt-4">
                          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-500">
                            {String(index + 1).padStart(2, "0")}
                          </span>

                          <h3 className="mt-2 font-serif text-base leading-snug transition group-hover:text-yellow-500">
                            {article.title}
                          </h3>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </aside>

          {/* RANGÉE 3 — GRAND FORMAT */}

          <section className="lg:col-span-4">
            {bottomCard && (
              <Link
                href={`/article/${bottomCard.slug}`}
                className="group block"
              >
                <article className="h-full overflow-hidden rounded-xl border border-gray-800 transition hover:border-yellow-500">
                  <div className="relative h-[300px] md:h-[380px]">
                    <Image
                      src={bottomCard.image}
                      alt={bottomCard.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 66vw"
                      className="object-cover transition duration-500 group-hover:scale-[1.02]"
                    />
                  </div>

                  <div className="p-6 md:p-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-500">
                      Grand Format
                    </p>

                    <h2 className="mt-4 font-serif text-3xl leading-tight md:text-4xl">
                      {bottomCard.title}
                    </h2>

                    <p className="mt-4 max-w-3xl leading-relaxed text-gray-300">
                      {bottomCard.description}
                    </p>

                    <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-yellow-500">
                      Lire le Grand Format →
                    </p>
                  </div>
                </article>
              </Link>
            )}
          </section>

          {/* RANGÉE 3 — BON À SAVOIR */}

          <aside className="lg:col-span-2 lg:border-l lg:border-gray-800 lg:pl-8">
            {goodToKnow.length > 0 && (
              <section className="rounded-xl bg-zinc-900 p-6">
                <div className="border-b border-zinc-700 pb-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-500">
                    Chronique pratique
                  </p>
                  <h2 className="mt-2 font-serif text-2xl">Bon à savoir</h2>
                </div>

                <div className="divide-y divide-zinc-700">
                  {goodToKnow.map((article) => (
                    <Link
                      key={article.id}
                      href={`/article/${article.slug}`}
                      className="group flex items-start gap-4 py-5 last:pb-0"
                    >
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-yellow-500" />

                      <div>
                        <h3 className="font-serif leading-snug transition group-hover:text-yellow-500">
                          {article.title}
                        </h3>

                        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-500">
                          En savoir plus →
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}