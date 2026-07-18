import Link from "next/link";

import { prisma } from "@/lib/prisma";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function AdminArticlesPage() {
  const articles = await prisma.article.findMany({
    orderBy: {
      updatedAt: "desc",
    },
    select: {
      id: true,
      slug: true,
      title: true,
      category: true,
      author: true,
      contentType: true,
      featured: true,
      published: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const publishedCount = articles.filter(
    (article) => article.published,
  ).length;

  const draftCount = articles.length - publishedCount;

  const featuredCount = articles.filter(
    (article) => article.featured,
  ).length;

  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-6 md:px-10 md:py-10">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-6 border-b border-zinc-800 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              href="/admin"
              className="text-sm font-semibold text-zinc-500 transition hover:text-yellow-500"
            >
              ← Retour au tableau de bord
            </Link>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.25em] text-yellow-500">
              ANDORRE 360 Studio
            </p>

            <h1 className="mt-3 font-serif text-4xl sm:text-5xl">
              Articles
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
              Consulte, crée et modifie les contenus publiés sur ANDORRE 360.
            </p>
          </div>

          <Link
            href="/admin/articles/nouveau"
            className="inline-flex items-center justify-center rounded-lg bg-yellow-500 px-5 py-3 text-sm font-bold text-black transition hover:bg-yellow-400"
          >
            Créer un article
          </Link>
        </header>

        <section className="grid gap-4 py-8 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <p className="text-sm text-zinc-500">
              Tous les articles
            </p>

            <p className="mt-3 font-serif text-4xl">
              {articles.length}
            </p>

            <p className="mt-2 text-xs text-zinc-600">
              Contenus enregistrés
            </p>
          </article>

          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <p className="text-sm text-zinc-500">
              Publiés
            </p>

            <p className="mt-3 font-serif text-4xl text-emerald-400">
              {publishedCount}
            </p>

            <p className="mt-2 text-xs text-zinc-600">
              Visibles sur le site
            </p>
          </article>

          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <p className="text-sm text-zinc-500">
              Brouillons
            </p>

            <p className="mt-3 font-serif text-4xl text-amber-400">
              {draftCount}
            </p>

            <p className="mt-2 text-xs text-zinc-600">
              En attente de publication
            </p>
          </article>

          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <p className="text-sm text-zinc-500">
              À la une
            </p>

            <p className="mt-3 font-serif text-4xl text-yellow-500">
              {featuredCount}
            </p>

            <p className="mt-2 text-xs text-zinc-600">
              Articles mis en avant
            </p>
          </article>
        </section>

        <section className="border-t border-zinc-800 py-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-500">
                Gestion des contenus
              </p>

              <h2 className="mt-2 font-serif text-3xl">
                Tous les articles
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                {articles.length} article
                {articles.length > 1 ? "s" : ""}
              </p>
            </div>

            <Link
              href="/admin/articles/nouveau"
              className="text-sm font-semibold text-zinc-400 transition hover:text-yellow-500"
            >
              Ajouter un article →
            </Link>
          </div>

          {articles.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-700 px-6 py-16 text-center">
              <p className="font-serif text-2xl text-zinc-300">
                Aucun article
              </p>

              <p className="mt-3 text-sm text-zinc-500">
                Crée ton premier contenu pour commencer à alimenter le journal.
              </p>

              <Link
                href="/admin/articles/nouveau"
                className="mt-6 inline-flex rounded-lg bg-yellow-500 px-5 py-3 text-sm font-bold text-black transition hover:bg-yellow-400"
              >
                Créer un article
              </Link>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
              <div className="hidden grid-cols-[minmax(0,2fr)_150px_140px_100px_110px_120px] gap-4 border-b border-zinc-800 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-600 xl:grid">
                <span>Article</span>
                <span>Catégorie</span>
                <span>Auteur</span>
                <span>Type</span>
                <span>Statut</span>
                <span className="text-right">Action</span>
              </div>

              <div className="divide-y divide-zinc-800">
                {articles.map((article) => (
                  <article
                    key={article.id}
                    className="grid gap-5 px-5 py-5 transition hover:bg-zinc-900/70 xl:grid-cols-[minmax(0,2fr)_150px_140px_100px_110px_120px] xl:items-center"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {article.featured && (
                          <span className="rounded-full border border-yellow-500/40 bg-yellow-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-yellow-500">
                            À la une
                          </span>
                        )}
                      </div>

                      <h3 className="mt-2 font-medium text-white xl:truncate">
                        {article.title}
                      </h3>

                      <p className="mt-1 text-xs text-zinc-600 xl:truncate">
                        /{article.slug}
                      </p>

                      <p className="mt-1 text-xs text-zinc-600">
                        Modifié le {formatDate(article.updatedAt)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wider text-zinc-600 xl:hidden">
                        Catégorie
                      </p>

                      <p className="mt-1 text-sm text-zinc-300 xl:mt-0 xl:truncate">
                        {article.category}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wider text-zinc-600 xl:hidden">
                        Auteur
                      </p>

                      <p className="mt-1 text-sm text-zinc-400 xl:mt-0 xl:truncate">
                        {article.author}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wider text-zinc-600 xl:hidden">
                        Type
                      </p>

                      {article.contentType === "video" ? (
                        <span className="mt-1 inline-flex rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-xs font-semibold text-sky-400 xl:mt-0">
                          Vidéo
                        </span>
                      ) : (
                        <span className="mt-1 inline-flex rounded-full border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-xs font-semibold text-zinc-300 xl:mt-0">
                          Article
                        </span>
                      )}
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wider text-zinc-600 xl:hidden">
                        Statut
                      </p>

                      {article.published ? (
                        <span className="mt-1 inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 xl:mt-0">
                          Publié
                        </span>
                      ) : (
                        <span className="mt-1 inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-400 xl:mt-0">
                          Brouillon
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2 xl:justify-end">
                      <Link
                        href={`/admin/articles/${article.id}`}
                        className="inline-flex items-center justify-center rounded-lg border border-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-300 transition hover:border-yellow-500 hover:text-yellow-500"
                      >
                        Modifier
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}