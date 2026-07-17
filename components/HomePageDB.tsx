import Image from "next/image";
import Link from "next/link";

import {
  getFeaturedArticle,
  getPublishedArticles,
} from "@/lib/articles";

function truncateText(text: string, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;

  return `${text.substring(0, maxLength)}...`;
}

export default async function HomePageDB() {
  const [featuredArticle, publishedArticles] = await Promise.all([
    getFeaturedArticle(),
    getPublishedArticles(),
  ]);

  const featured = featuredArticle ?? publishedArticles[0];

  if (!featured) {
    return (
      <main className="min-h-screen bg-black p-8 text-white">
        <h1 className="font-serif text-3xl">
          Aucun article disponible
        </h1>
      </main>
    );
  }

  const others = publishedArticles.filter(
    (article) => article.id !== featured.id
  );

  const mainArticle = others[0];
  const briefs = others.slice(1, 4);
  const rightCards = others.slice(4, 6);
  const bottomCard =
    others.length > 0 ? others[others.length - 1] : undefined;

  return (
    <main className="min-h-screen bg-black text-white">
      {/* UNE PRINCIPALE */}

      <Link
        href={`/article/${featured.slug}`}
        className="block"
      >
        <section className="relative h-[75vh] overflow-hidden">
          <Image
            src={featured.image}
            alt={featured.title}
            fill
            priority
            sizes="100vw"
            className="scale-105 object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-black/20" />

          <div className="absolute bottom-12 left-8 max-w-3xl md:left-16">
            <p className="mb-4 text-sm uppercase tracking-[0.25em] text-yellow-500">
              À LA UNE • {featured.category}
            </p>

            <h1 className="font-serif text-4xl leading-tight md:text-6xl">
              {featured.title}
            </h1>

            <p className="mt-5 max-w-xl text-lg text-gray-200">
              {truncateText(featured.description, 1800)}
            </p>

            <p className="mt-6 text-sm tracking-widest text-yellow-500">
              LIRE L’ARTICLE →
            </p>
          </div>
        </section>
      </Link>

      {/* ARTICLES */}

      <section className="p-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* COLONNE GAUCHE */}

          <div className="space-y-6 md:col-span-2">
            {mainArticle && (
              <Link
                href={`/article/${mainArticle.slug}`}
                className="block"
              >
                <article className="overflow-hidden rounded-xl border border-gray-800 shadow-lg transition hover:border-yellow-500">
                  <div className="relative h-[420px]">
                    <Image
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

            {/* TROIS BRÈVES */}

            {briefs.length > 0 && (
              <div className="grid gap-4 md:grid-cols-3">
                {briefs.map((article) => (
                  <Link
                    key={article.id}
                    href={`/article/${article.slug}`}
                    className="block"
                  >
                    <article className="h-full rounded-lg border border-gray-800 p-4 transition hover:border-yellow-500">
                      <p className="mb-2 text-xs uppercase tracking-widest text-yellow-500">
                        {article.category}
                      </p>

                      <h3 className="font-serif text-sm leading-snug">
                        {article.title}
                      </h3>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* COLONNE DROITE */}

          <aside className="space-y-12">
            {rightCards.map((article) => (
              <Link
                key={article.id}
                href={`/article/${article.slug}`}
                className="block"
              >
                <article className="overflow-hidden rounded-xl border border-gray-800 shadow-lg transition hover:border-yellow-500">
                  <div className="relative h-48">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>

                  <div className="p-5">
                    <p className="text-sm uppercase tracking-widest text-yellow-500">
                      {article.category}
                    </p>

                    <h2 className="mt-2 font-serif text-xl">
                      {article.title}
                    </h2>

                    <p className="mt-3 text-sm text-gray-400">
                      {article.description}
                    </p>
                  </div>
                </article>
              </Link>
            ))}
          </aside>
        </div>
      </section>

      {/* ARTICLE CENTRÉ EN BAS */}

      {bottomCard && (
        <section className="px-8 pb-14">
          <div className="grid grid-cols-1 md:grid-cols-6">
            <Link
              href={`/article/${bottomCard.slug}`}
              className="block md:col-span-4 md:col-start-2"
            >
              <article className="overflow-hidden rounded-xl border border-gray-800 bg-black transition hover:border-yellow-500">
                <div className="relative h-72">
                  <Image
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
    </main>
  );
}