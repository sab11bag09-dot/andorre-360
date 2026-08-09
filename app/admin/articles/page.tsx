import {
  Badge,
  Button,
  DataTable,
  DataTableRow,
  EmptyState,
  PageHeader,
  SectionHeader,
  StatCard,
} from "@/components/admin/ui";

import EditorialStatusBadge from "@/components/admin/article/EditorialStatusBadge";
import { prisma } from "@/lib/prisma";
import { isPublicArticle } from "@/lib/public-article";
const ARTICLE_GRID_TEMPLATE =
  "minmax(0, 2fr) 150px 140px 100px 110px 120px";


function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

type AdminArticlesPageProps = {
  searchParams?: Promise<{
    status?: string;
  }>;
};

export default async function AdminArticlesPage({
  searchParams,
}: AdminArticlesPageProps) {
  const params = await searchParams;

  const activeStatus =
    params?.status === "published" || params?.status === "draft"
      ? params.status
      : "all";
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
      editorialStatus: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const publishedCount = articles.filter(
    isPublicArticle,
  ).length;

  const draftCount = articles.length - publishedCount;

  const featuredCount = articles.filter(
    (article) => article.featured,
  ).length;
  const filteredArticles = articles.filter((article) => {
  if (activeStatus === "published") {
    return isPublicArticle(article);
  }

  if (activeStatus === "draft") {
    return !isPublicArticle(article);
  }

  return true;
});

const sectionTitle =
  activeStatus === "published"
    ? "Articles publiés"
    : activeStatus === "draft"
      ? "Brouillons"
      : "Tous les articles";

  return (
  <>
        <PageHeader
  backHref="/admin"
  backLabel="Retour au tableau de bord"
  title="Articles"
  description="Consulte, crée et modifie les contenus publiés sur ANDORRA 360."
  actions={
    <Button href="/admin/articles/nouveau">
      Créer un article
    </Button>
  }
/>
        <section className="grid gap-4 py-8 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
  title="Tous les articles"
  value={articles.length}
  description="Contenus enregistrés"
  href="/admin/articles"
/>

<StatCard
  title="Publiés"
  value={publishedCount}
  description="Visibles sur le site"
  valueClassName="text-emerald-400"
  href="/admin/articles?status=published"
/>

<StatCard
  title="Brouillons"
  value={draftCount}
  description="En attente de publication"
  valueClassName="text-amber-400"
  href="/admin/articles?status=draft"
/>

<StatCard
  title="À la une"
  value={featuredCount}
  description="Articles mis en avant"
  valueClassName="text-yellow-500"
/>
</section>
        <section className="border-t border-zinc-800 py-8">
          <SectionHeader
  eyebrow="Gestion des contenus"
  title={sectionTitle}
description={`${filteredArticles.length} article${
  filteredArticles.length > 1 ? "s" : ""
}`}
  actions={
    <Button
      href="/admin/articles/nouveau"
      variant="outline"
    >
      Ajouter un article →
    </Button>
  }
/>

          {filteredArticles.length === 0 ? (
            <EmptyState
  title="Aucun article"
  description="Crée ton premier contenu pour commencer à alimenter le journal."
  action={
    <Button href="/admin/articles/nouveau">
      Créer un article
    </Button>
  }
/>
          ) : (
            <DataTable
 gridTemplateColumns={ARTICLE_GRID_TEMPLATE}
  columns={[
    { key: "title", label: "Article" },
    { key: "category", label: "Catégorie" },
    { key: "author", label: "Auteur" },
    { key: "type", label: "Type" },
    { key: "status", label: "Statut" },
   { key: "actions", label: "Action", align: "right" },
  ]}
>
  {filteredArticles.map((article) => (
    <DataTableRow
  key={article.id}
  className="py-5 transition hover:bg-zinc-900/70"
>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                       {article.featured && (
  <Badge variant="warning">
    À la une
  </Badge>
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
  <Badge variant="info">
    Vidéo
  </Badge>
) : (
  <Badge>
    Article
  </Badge>
)}
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wider text-zinc-600 xl:hidden">
                        Statut
                      </p>

                                          <EditorialStatusBadge
                        status={article.editorialStatus}
                      />
                    </div>

                    <div className="flex gap-2 xl:justify-end">
                      <Button
  href={`/admin/articles/${article.id}`}
  variant="outline"
>
  Modifier
</Button>
                    </div>
                  </DataTableRow>
                ))}
            </DataTable>
          )}
        </section>
        </>
);
}
