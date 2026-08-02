import SafeImage from "@/components/SafeImage";
import Link from "next/link";

import { getArticlesByCategory } from "@/lib/articles";

type CategoryPageProps = {
  category: string;
  title?: string;
};

export default async function CategoryPage({
  category,
  title,
}: CategoryPageProps) {
  const articles = await getArticlesByCategory(category);

  const featured = articles[0];
  const mainArticle = articles[1];
  const rightCards = articles.slice(2, 5);
  const briefs = articles.slice(5, 8);

  const bottomCard =
    articles.length > 8 ? articles[articles.length - 1] : undefined;

  if (!featured) {
    return (
      <main className="min-h-screen bg-black px-8 py-20 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm uppercase tracking-[0.25em] text-yellow-500">
            {title}
          </p>

          <h1 className="mt-4 font-serif text-4xl">
            Aucun article dans la rubrique {title}
          </h1>

          <p className="mt-4 text-gray-400">
            Les prochains contenus publiés dans cette rubrique
            apparaîtront ici.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* HERO DE LA RUBRIQUE */}

      <Link
        href={`/article/${featured.slug}`}
        className="block"
      >
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

          <div className="absolute bottom-10 left-0 right-0">
            <div className="mx-auto max-w-7xl px-8">
              <div className="max-w-3xl">
                <p className="text-sm uppercase tracking-[0.25em] text-yellow-500">
                  {title}
                </p>

                <h1 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
                  {featured.title}
                </h1>

                <p className="mt-4 max-w-2xl text-gray-200">
                  {featured.description}
                </p>

                <p className="mt-5 text-sm tracking-widest text-yellow-500">
                  LIRE L’ARTICLE →
                </p>
              </div>
            </div>
          </div>
        </section>
      </Link>

      <section className="mx-auto max-w-7xl px-8 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          {/* COLONNE PRINCIPALE */}

          <div className="md:col-span-2">
            {mainArticle && (
              <Link
                href={`/article/${mainArticle.slug}`}
                className="block"
              >
                <article className="overflow-hidden rounded-xl border border-gray-800 transition hover:border-yellow-500">
                  <div className="relative h-[420px]">
                    <SafeImage
                      src={mainArticle.image}
                      alt={mainArticle.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 66vw"
                      className="object-cover"
                    />
                  </div>

                  <div className="p-6">
                    <p className="text-sm uppercase tracking-widest text-yellow-500">
                      {mainArticle.category}
                    </p>

                    <h2 className="mt-3 font-serif text-3xl">
                      {mainArticle.title}
                    </h2>

                    <p className="mt-4 text-gray-400">
                      {mainArticle.description}
                    </p>

                    <p className="mt-5 text-sm tracking-widest text-yellow-500">
                      LIRE L’ARTICLE →
                    </p>
                  </div>
                </article>
              </Link>
            )}

            {/* BRÈVES */}

            {briefs.length > 0 && (
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {briefs.map((article) => (
                  <Link
                    key={article.id}
                    href={`/article/${article.slug}`}
                    className="block"
                  >
                    <article className="h-full rounded-lg border border-gray-800 p-4 transition hover:border-yellow-500">
                      <p className="text-xs uppercase tracking-widest text-yellow-500">
                        {article.category}
                      </p>

                      <h3 className="mt-2 font-serif leading-snug">
                        {article.title}
                      </h3>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* COLONNE DROITE */}

          <aside className="space-y-6">
            {rightCards.map((article) => (
              <Link
                key={article.id}
                href={`/article/${article.slug}`}
                className="block"
              >
                <article className="overflow-hidden rounded-xl border border-gray-800 transition hover:border-yellow-500">
                  <div className="relative h-40">
                    <SafeImage
                      src={article.image}
                      alt={article.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>

                  <div className="p-4">
                    <p className="text-xs uppercase tracking-widest text-yellow-500">
                      {article.category}
                    </p>

                    <h3 className="mt-2 font-serif">
                      {article.title}
                    </h3>
                  </div>
                </article>
              </Link>
            ))}
          </aside>
        </div>

        {/* ARTICLE DE BAS DE PAGE */}

        {bottomCard && (
          <section className="mt-14">
            <div className="grid grid-cols-1 md:grid-cols-6">
              <Link
                href={`/article/${bottomCard.slug}`}
                className="block md:col-span-4 md:col-start-2"
              >
                <article className="overflow-hidden rounded-xl border border-gray-800 transition hover:border-yellow-500">
                  <div className="relative h-72">
                    <SafeImage
                      src={bottomCard.image}
                      alt={bottomCard.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 66vw"
                      className="object-cover"
                    />
                  </div>

                  <div className="p-6 md:p-8">
                    <p className="text-sm uppercase tracking-[0.25em] text-yellow-500">
                      {bottomCard.category}
                    </p>

                    <h2 className="mt-3 font-serif text-3xl leading-tight md:text-4xl">
                      {bottomCard.title}
                    </h2>

                    <p className="mt-4 text-gray-300">
                      {bottomCard.description}
                    </p>

                    <p className="mt-5 text-sm tracking-widest text-yellow-500">
                      LIRE L’ARTICLE →
                    </p>
                  </div>
                </article>
              </Link>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
