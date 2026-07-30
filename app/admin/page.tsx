import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Badge,
  Button,
  EmptyState,
  PageHeader,
  SectionHeader,
  StatCard,
} from "@/components/admin/ui";

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
  title: "Sources",
  description:
    "Configurer les organismes et les flux surveillés par la Veille.",
  href: "/admin/sources",
  action: "Gérer les sources",
},
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
  <>
        <PageHeader
  title="Tableau de bord"
  description="Pilote les contenus, les médias et la mise en avant éditoriale d’ANDORRE 360."
  actions={
    <>
      <Button
        href="/"
        variant="outline"
        target="_blank"
        rel="noreferrer"
      >
        Voir le site
      </Button>

      <Button href="/admin/articles/nouveau">
        Créer un article
      </Button>
    </>
  }
/>

        <section className="grid gap-4 py-8 sm:grid-cols-2 xl:grid-cols-5">
  <StatCard
    title="Articles"
    value={articleCount}
    description="Tous les contenus enregistrés"
    href="/admin/articles"
  />

  <StatCard
  title="Publiés"
  value={publishedArticleCount}
  description="Visibles sur le site"
  valueClassName="text-emerald-400"
  href="/admin/articles?status=published"
/>


  <StatCard
  title="Brouillons"
  value={draftArticleCount}
  description="En attente de publication"
  valueClassName="text-amber-400"
  href="/admin/articles?status=draft"
/>

  <StatCard
    title="Médias"
    value={mediaCount}
    description="Images dans la médiathèque"
    href="/admin/media"
  />

  <StatCard
    title="Publications"
    value={publicationCount}
    description="Affectations éditoriales"
    href="/admin/diffusion"
  />
</section>
        <section className="border-t border-zinc-800 py-8">
          <SectionHeader
  eyebrow="Navigation"
  title="Accès rapides"
/>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
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
          <SectionHeader
  eyebrow="Activité récente"
  title="Derniers articles"
  actions={
    <Button
      href="/admin/articles"
      variant="outline"
      className="px-3 py-2"
    >
      Voir tous les articles →
    </Button>
  }
/>

          {recentArticles.length === 0 ? (
            <EmptyState
  title="Aucun article"
  description="Crée ton premier article pour commencer à alimenter le Studio."
  action={
    <Button href="/admin/articles/nouveau">
      Créer un article
    </Button>
  }
/>
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
  <Badge
    variant="highlight"
    className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider"
  >
    À la une
  </Badge>
)}

                        {article.contentType === "video" && (
  <Badge
    variant="info"
    className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider"
  >
    Vidéo
  </Badge>
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
  <Badge variant="success">
    Publié
  </Badge>
) : (
  <Badge variant="warning">
    Brouillon
  </Badge>
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
        </>
);
}