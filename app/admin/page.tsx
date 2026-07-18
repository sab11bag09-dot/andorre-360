import Link from "next/link";

import { prisma } from "@/lib/prisma";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function AdminPage() {
  const [
    articleCount,
    publishedArticleCount,
    draftArticleCount,
    mediaCount,
    publicationCount,
    recentArticles,
  ] = await Promise.all([
    prisma.article.count(),

    prisma.article.count({
      where: {
        published: true,
      },
    }),

    prisma.article.count({
      where: {
        published: false,
      },
    }),

    prisma.media.count(),

    prisma.publication.count(),

    prisma.article.findMany({
      orderBy: {
        updatedAt: "desc",
      },
      take: 8,
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        author: true,
        contentType: true,
        published: true,
        featured: true,
        updatedAt: true,
      },
    }),
  ]);

  const navigationCards = [
    {
      title: "Articles",
      description:
        "Créer, consulter et modifier les contenus publiés sur ANDORRE 360.",
      href: "/admin/articles",
      action: "Gérer les articles",
    },
    {
      title: "Médiathèque",
      description:
        "Téléverser des images et gérer les informations des médias.",
      href: "/admin/media",
      action: "Ouvrir la médiathèque",
    },
    {
      title: "Éditorial",
      description:
        "Organiser la Une et les différentes zones éditoriales du site.",
      href: "/admin/editorial",
      action: "Gérer l’éditorial",
    },
    {
      title: "Diffusion",
      description:
        "Piloter les publications et leurs différents canaux de diffusion.",
      href: "/admin/diffusion",
      action: "Gérer la diffusion",
    },
  ];

  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-6 md:px-10 md:py-10">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-6 border-b border-zinc-800 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-500">
              ANDORRE 360 Studio
            </p>

            <h1 className="mt-3 font-serif text-4xl sm:text-5xl">
              Tableau de bord
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
              Pilote les contenus, les médias et la mise en avant éditoriale
              d’ANDORRE 360.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center justify-center rounded-lg border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-900"
            >
              Voir le site
            </Link>

            <Link
              href="/admin/articles/nouveau"
              className="inline-flex items-center justify-center rounded-lg bg-yellow-500 px-5 py-3 text-sm font-bold text-black transition hover:bg-yellow-400"
            >
              Créer un article
            </Link>
          </div>
        </header>

        <section className="grid gap-4 py-8 sm:grid-cols-2 xl:grid-cols-5">
          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <p className="text-sm text-zinc-500">Articles</p>
            <p className="mt-3 font-serif text-4xl">{articleCount}</p>
            <p className="mt-2 text-xs text-zinc-600">
              Tous les contenus enregistrés
            </p>
          </article>

          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <p className="text-sm text-zinc-500">Publiés</p>
            <p className="mt-3 font-serif text-4xl text-emerald-400">
              {publishedArticleCount}
            </p>
            <p className="mt-2 text-xs text-zinc-600">
              Visibles sur le site
            </p>
          </article>

          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <p className="text-sm text-zinc-500">Brouillons</p>
            <p className="mt-3 font-serif text-4xl text-amber-400">
              {draftArticleCount}
            </p>
            <p className="mt-2 text-xs text-zinc-600">
              En attente de publication
            </p>
          </article>

          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <p className="text-sm text-zinc-500">Médias</p>
            <p className="mt-3 font-serif text-4xl">{mediaCount}</p>
            <p className="mt-2 text-xs text-zinc-600">
              Images dans la médiathèque
            </p>
          </article>

          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <p className="text-sm text-zinc-500">Publications</p>
            <p className="mt-3 font-serif text-4xl">{publicationCount}</p>
            <p className="mt-2 text-xs text-zinc-600">
              Affectations éditoriales
            </p>
          </article>
        </section>

        <section className="border-t border-zinc-800 py-8">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-500">
              Navigation
            </p>

            <h2 className="mt-2 font-serif text-3xl">
              Accès rapides
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {navigationCards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group flex min-h-52 flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-6 transition hover:-translate-y-1 hover:border-yellow-500"
              >
                <div>
                  <h3 className="font-serif text-2xl transition group-hover:text-yellow-500">
                    {card.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-zinc-500">
                    {card.description}
                  </p>
                </div>

                <p className="mt-8 text-sm font-semibold text-zinc-300 transition group-hover:text-yellow-500">
                  {card.action} →
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="border-t border-zinc-800 py-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-500">
                Activité récente
              </p>

              <h2 className="mt-2 font-serif text-3xl">
                Derniers articles
              </h2>
            </div>

            <Link
              href="/admin/articles"
              className="text-sm font-semibold text-zinc-400 transition hover:text-yellow-500"
            >
              Voir tous les articles →
            </Link>
          </div>

          {recentArticles.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-700 px-6 py-14 text-center">
              <p className="font-serif text-2xl text-zinc-300">
                Aucun article
              </p>

              <p className="mt-2 text-sm text-zinc-500">
                Crée ton premier article pour commencer à alimenter le Studio.
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
              <div className="hidden grid-cols-[minmax(0,2fr)_minmax(130px,0.7fr)_minmax(120px,0.7fr)_110px_110px] gap-4 border-b border-zinc-800 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-600 lg:grid">
                <span>Article</span>
                <span>Catégorie</span>
                <span>Auteur</span>
                <span>Statut</span>
                <span className="text-right">Action</span>
              </div>

              <div className="divide-y divide-zinc-800">
                {recentArticles.map((article) => (
                  <article
                    key={article.id}
                    className="grid gap-4 px-5 py-5 transition hover:bg-zinc-900/70 lg:grid-cols-[minmax(0,2fr)_minmax(130px,0.7fr)_minmax(120px,0.7fr)_110px_110px] lg:items-center"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {article.featured && (
                          <span className="rounded-full border border-yellow-500/40 bg-yellow-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-yellow-500">
                            À la une
                          </span>
                        )}

                        {article.contentType === "video" && (
                          <span className="rounded-full border border-sky-500/40 bg-sky-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-sky-400">
                            Vidéo
                          </span>
                        )}
                      </div>

                      <h3 className="mt-2 truncate font-medium text-white">
                        {article.title}
                      </h3>

                      <p className="mt-1 truncate text-xs text-zinc-600">
                        /{article.slug} · Mis à jour le{" "}
                        {formatDate(article.updatedAt)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wider text-zinc-600 lg:hidden">
                        Catégorie
                      </p>

                      <p className="mt-1 truncate text-sm text-zinc-300 lg:mt-0">
                        {article.category}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wider text-zinc-600 lg:hidden">
                        Auteur
                      </p>

                      <p className="mt-1 truncate text-sm text-zinc-400 lg:mt-0">
                        {article.author}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wider text-zinc-600 lg:hidden">
                        Statut
                      </p>

                      {article.published ? (
                        <span className="mt-1 inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 lg:mt-0">
                          Publié
                        </span>
                      ) : (
                        <span className="mt-1 inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-400 lg:mt-0">
                          Brouillon
                        </span>
                      )}
                    </div>

                    <div className="lg:text-right">
                      <Link
                        href={`/admin/articles/${article.id}`}
                        className="inline-flex rounded-lg border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:border-yellow-500 hover:text-yellow-500"
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