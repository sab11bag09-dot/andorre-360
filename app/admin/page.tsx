import Link from "next/link";

import { getPublishedArticles } from "@/lib/articles";

const CATEGORY_LABELS: Record<string, string> = {
  ACTUALITÉ: "Actualité",
  ÉCONOMIE: "Économie",
  SOCIÉTÉ: "Société",
  CULTURE: "Culture",
  SPORTS: "Sports",
  MONTAGNE: "Montagne",
  ÉDITORIAL: "Éditorial",
};

function formatCategory(category: string) {
  return CATEGORY_LABELS[category] ?? category;
}

export default async function AdminPage() {
  const articles = await getPublishedArticles();

  const featuredArticles = articles.filter((article) => article.featured);

  const categoryCounts = articles.reduce<Record<string, number>>(
    (counts, article) => {
      counts[article.category] = (counts[article.category] ?? 0) + 1;
      return counts;
    },
    {}
  );

  const categories = Object.entries(categoryCounts).sort(
    ([, firstCount], [, secondCount]) => secondCount - firstCount
  );

  const recentArticles = articles.slice(0, 10);

  return (
    <main className="min-h-screen bg-zinc-950 px-5 py-8 text-zinc-100 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="border-b border-zinc-800 pb-8">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-yellow-500">
                ANDORRE 360 Studio
              </p>

              <h1 className="mt-3 font-serif text-4xl text-white sm:text-5xl">
                Tableau de bord
              </h1>

              <p className="mt-3 max-w-2xl leading-relaxed text-zinc-400">
                Suivez l’activité éditoriale et accédez rapidement aux
                publications de la rédaction.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/"
                className="rounded-lg border border-zinc-700 px-5 py-3 text-center text-sm font-semibold text-zinc-300 transition hover:border-zinc-500 hover:text-white"
              >
                Voir le site
              </Link>

              <Link
                href="/admin/articles/nouveau"
                className="rounded-lg bg-yellow-500 px-6 py-3 text-center text-sm font-semibold text-black transition hover:bg-yellow-400"
              >
                Créer une publication
              </Link>
            </div>
          </div>
        </header>

        <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-sm text-zinc-500">Publications</p>

            <p className="mt-4 text-4xl font-bold text-white">
              {articles.length}
            </p>

            <p className="mt-2 text-xs text-zinc-600">
              Contenus actuellement publiés
            </p>
          </article>

          <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-sm text-zinc-500">Rubriques actives</p>

            <p className="mt-4 text-4xl font-bold text-white">
              {categories.length}
            </p>

            <p className="mt-2 text-xs text-zinc-600">
              Rubriques contenant au moins un article
            </p>
          </article>

          <article className="rounded-2xl border border-yellow-500/50 bg-zinc-900 p-6">
            <p className="text-sm text-yellow-500">Contenus vedettes</p>

            <p className="mt-4 text-4xl font-bold text-white">
              {featuredArticles.length}
            </p>

            <p className="mt-2 text-xs text-zinc-600">
              Publications signalées pour une mise en avant
            </p>
          </article>

          <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-sm text-zinc-500">Dernière activité</p>

            <p className="mt-4 line-clamp-2 min-h-[3.5rem] font-serif text-xl text-white">
              {articles[0]?.title ?? "Aucune publication"}
            </p>

            <p className="mt-2 text-xs text-zinc-600">
              Publication la plus récente
            </p>
          </article>
        </section>

        <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
            <div className="flex flex-col gap-4 border-b border-zinc-800 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-500">
                  Rédaction
                </p>

                <h2 className="mt-2 font-serif text-2xl text-white">
                  Publications récentes
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Les dix derniers contenus publiés.
                </p>
              </div>

              <Link
                href="/admin/articles/nouveau"
                className="text-sm font-semibold text-yellow-500 transition hover:text-yellow-400"
              >
                Nouvelle publication
              </Link>
            </div>

            {recentArticles.length > 0 ? (
              <div className="divide-y divide-zinc-800">
                {recentArticles.map((article) => (
                  <article
                    key={article.id}
                    className="px-6 py-5 transition hover:bg-zinc-800/40"
                  >
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-yellow-500">
                            {formatCategory(article.category)}
                          </p>

                          {article.featured && (
                            <span className="rounded-full border border-yellow-500/40 bg-yellow-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-yellow-500">
                              Vedette
                            </span>
                          )}
                        </div>

                        <h3 className="mt-2 truncate font-serif text-xl text-white">
                          {article.title}
                        </h3>

                        <p className="mt-2 text-sm text-zinc-500">
                          Par {article.author}
                        </p>
                      </div>

                      <div className="flex shrink-0 gap-3">
                        <Link
                          href={`/article/${article.slug}`}
                          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-zinc-500 hover:text-white"
                        >
                          Voir
                        </Link>

                        <Link
                          href={`/admin/articles/${article.id}`}
                          className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-yellow-500"
                        >
                          Modifier
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="px-6 py-16 text-center">
                <p className="font-serif text-2xl text-white">
                  Aucune publication
                </p>

                <p className="mt-2 text-sm text-zinc-500">
                  La première publication apparaîtra ici.
                </p>

                <Link
                  href="/admin/articles/nouveau"
                  className="mt-6 inline-flex rounded-lg bg-yellow-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-yellow-400"
                >
                  Créer une publication
                </Link>
              </div>
            )}
          </section>

          <aside className="space-y-8">
            <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-500">
                Rubriques
              </p>

              <h2 className="mt-2 font-serif text-2xl text-white">
                Répartition éditoriale
              </h2>

              <div className="mt-6 space-y-5">
                {categories.length > 0 ? (
                  categories.map(([category, count]) => {
                    const percentage =
                      articles.length > 0
                        ? Math.round((count / articles.length) * 100)
                        : 0;

                    return (
                      <div key={category}>
                        <div className="flex items-center justify-between gap-4 text-sm">
                          <span className="font-semibold text-zinc-300">
                            {formatCategory(category)}
                          </span>

                          <span className="text-zinc-500">{count}</span>
                        </div>

                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                          <div
                            className="h-full rounded-full bg-yellow-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-zinc-500">
                    Aucune donnée disponible.
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-500">
                Mise en avant
              </p>

              <h2 className="mt-2 font-serif text-2xl text-white">
                Contenus vedettes
              </h2>

              <div className="mt-6 space-y-4">
                {featuredArticles.length > 0 ? (
                  featuredArticles.slice(0, 5).map((article) => (
                    <Link
                      key={article.id}
                      href={`/admin/articles/${article.id}`}
                      className="block rounded-xl border border-zinc-800 bg-zinc-950 p-4 transition hover:border-yellow-500/50"
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-yellow-500">
                        {formatCategory(article.category)}
                      </p>

                      <p className="mt-2 line-clamp-2 font-semibold leading-snug text-white">
                        {article.title}
                      </p>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-zinc-700 px-4 py-6 text-center">
                    <p className="text-sm text-zinc-500">
                      Aucun contenu vedette.
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-yellow-500 bg-yellow-500 p-6 text-black">
              <p className="text-xs font-semibold uppercase tracking-[0.25em]">
                Accès rapide
              </p>

              <h2 className="mt-2 font-serif text-2xl">
                Une information à publier ?
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-black/70">
                Ouvrez le Studio et définissez immédiatement sa rubrique et sa
                mission éditoriale.
              </p>

              <Link
                href="/admin/articles/nouveau"
                className="mt-6 inline-flex rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
              >
                Ouvrir le Studio
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}