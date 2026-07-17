import Image from "next/image";
import Link from "next/link";

import { articles } from "@/data/articles";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getArticleSlug(article: {
  slug?: string;
  title: string;
}): string {
  return article.slug?.trim() || slugify(article.title);
}

export default function ActualitePage() {
  const items = articles.filter(
    (article) => article.category === "ACTUALITÉ"
  );

  const featured = items[0];
  const mainArticle = items[1];
  const rightCards = items.slice(2, 5);
  const briefs = items.slice(5, 8);
  const bottomCard = items[8];

  return (
    <main className="min-h-screen bg-black text-white">
      {/* ===================== */}
      {/* HERO DE LA RUBRIQUE */}
      {/* ===================== */}

      {featured && (
        <Link
          href={`/article/${getArticleSlug(featured)}`}
          className="block"
        >
          <section className="relative h-[60vh] overflow-hidden">
            <Image
              src={featured.image}
              alt={featured.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

            <div className="absolute bottom-10 left-8 max-w-3xl">
              <p className="text-sm tracking-widest text-yellow-500">
                ACTUALITÉ
              </p>

              <h1 className="mt-4 font-serif text-5xl">
                {featured.title}
              </h1>

              <p className="mt-4 text-gray-300">
                {featured.description}
              </p>

              <p className="mt-5 text-sm tracking-widest text-yellow-500">
                LIRE L’ARTICLE →
              </p>
            </div>
          </section>
        </Link>
      )}

      <section className="p-8">
        {/* ===================== */}
        {/* ZONE PRINCIPALE */}
        {/* ===================== */}

        <div className="grid gap-8 md:grid-cols-3">
          {/* ARTICLE PRINCIPAL */}

          <div className="md:col-span-2">
            {mainArticle && (
              <Link
                href={`/article/${getArticleSlug(mainArticle)}`}
                className="block"
              >
                <article className="overflow-hidden rounded-xl border border-gray-800 transition hover:border-yellow-500">
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
                    <p className="text-sm text-yellow-500">
                      {mainArticle.category}
                    </p>

                    <h2 className="mt-3 font-serif text-3xl">
                      {mainArticle.title}
                    </h2>

                    <p className="mt-4 text-gray-400">
                      {mainArticle.description}
                    </p>
                  </div>
                </article>
              </Link>
            )}

            {/* TROIS BRÈVES */}

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {briefs.map((article) => {
                const articleSlug = getArticleSlug(article);

                return (
                  <Link
                    key={articleSlug}
                    href={`/article/${articleSlug}`}
                    className="block"
                  >
                    <article className="h-full rounded-lg border border-gray-800 p-4 transition hover:border-yellow-500">
                      <p className="text-xs text-yellow-500">
                        {article.category}
                      </p>

                      <h3 className="mt-2 font-serif">
                        {article.title}
                      </h3>
                    </article>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* TROIS CARTES À DROITE */}

          <aside className="space-y-6">
            {rightCards.map((article) => {
              const articleSlug = getArticleSlug(article);

              return (
                <Link
                  key={articleSlug}
                  href={`/article/${articleSlug}`}
                  className="block"
                >
                  <article className="overflow-hidden rounded-xl border border-gray-800 transition hover:border-yellow-500">
                    <div className="relative h-40">
                      <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>

                    <div className="p-4">
                      <p className="text-xs text-yellow-500">
                        {article.category}
                      </p>

                      <h3 className="mt-2 font-serif">
                        {article.title}
                      </h3>
                    </div>
                  </article>
                </Link>
              );
            })}
          </aside>
        </div>

        {/* ===================== */}
        {/* CARTE DU BAS */}
        {/* ===================== */}

        {bottomCard && (
          <div className="mx-auto mt-10 max-w-xl">
            <Link
              href={`/article/${getArticleSlug(bottomCard)}`}
              className="block"
            >
              <article className="overflow-hidden rounded-xl border border-gray-800 transition hover:border-yellow-500">
                <div className="relative h-64">
                  <Image
                    src={bottomCard.image}
                    alt={bottomCard.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 576px"
                    className="object-cover"
                  />
                </div>

                <div className="p-5">
                  <h2 className="font-serif text-2xl">
                    {bottomCard.title}
                  </h2>
                </div>
              </article>
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}