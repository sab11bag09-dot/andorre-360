import type { Prisma } from "@/lib/generated/prisma/client";
import Link from "next/link";

import EditorialStatusBadge from "@/components/admin/article/EditorialStatusBadge";
import { Button, EmptyState, PageHeader } from "@/components/admin/ui";
import {
  EDITORIAL_EVENT_ACTIONS,
  formatEditorialEventDate,
  getEditorialEventActionLabel,
  getEditorialEventContextLabels,
} from "@/lib/editorial-history-display";
import {
  buildEditorialHistoryHref,
  parseEditorialHistoryFilters,
} from "@/lib/editorial-history-query";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 25;

type EditorialHistoryPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EditorialHistoryPage({
  searchParams,
}: EditorialHistoryPageProps) {
  const filters = parseEditorialHistoryFilters(await searchParams);
  const where: Prisma.EditorialEventWhereInput = {
    ...(filters.articleId ? { articleId: filters.articleId } : {}),
    ...(filters.actor ? { actorEmail: { contains: filters.actor } } : {}),
    ...(filters.action ? { action: filters.action } : {}),
  };

  const totalEvents = await prisma.editorialEvent.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalEvents / PAGE_SIZE));
  const currentPage = Math.min(filters.page, totalPages);
  const events = await prisma.editorialEvent.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      id: true,
      action: true,
      actorEmail: true,
      fromStatus: true,
      toStatus: true,
      details: true,
      createdAt: true,
      article: {
        select: {
          id: true,
          title: true,
        },
      },
      translation: {
        select: {
          locale: true,
        },
      },
    },
  });

  return (
    <>
      <PageHeader
        backHref="/admin"
        backLabel="Retour au tableau de bord"
        title="Historique éditorial"
        description="Consulte les actions enregistrées sur les articles, les traductions, le Fil info et les placements éditoriaux."
      />

      <section className="border-b border-zinc-800 py-8">
        <form
          method="get"
          className="grid gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-5 lg:grid-cols-[160px_minmax(220px,1fr)_minmax(240px,1fr)_auto] lg:items-end"
        >
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            ID article
            <input
              name="articleId"
              type="number"
              min="1"
              defaultValue={filters.articleId ?? ""}
              className="mt-2 w-full rounded-lg border border-zinc-700 bg-black px-3 py-2.5 text-sm text-white outline-none focus:border-yellow-500"
            />
          </label>

          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Administrateur
            <input
              name="actor"
              type="search"
              defaultValue={filters.actor}
              placeholder="adresse@email.com"
              className="mt-2 w-full rounded-lg border border-zinc-700 bg-black px-3 py-2.5 text-sm normal-case text-white outline-none placeholder:text-zinc-700 focus:border-yellow-500"
            />
          </label>

          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Type d’action
            <select
              name="action"
              defaultValue={filters.action ?? ""}
              className="mt-2 w-full rounded-lg border border-zinc-700 bg-black px-3 py-2.5 text-sm normal-case text-white outline-none focus:border-yellow-500"
            >
              <option value="">Toutes les actions</option>
              {EDITORIAL_EVENT_ACTIONS.map((action) => (
                <option key={action} value={action}>
                  {getEditorialEventActionLabel(action)}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-wrap gap-2">
            <Button type="submit">Filtrer</Button>
            <Button href="/admin/history" variant="outline">
              Réinitialiser
            </Button>
          </div>
        </form>
      </section>

      <section className="py-8" aria-labelledby="history-results-title">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-500">
              Journal en lecture seule
            </p>
            <h2 id="history-results-title" className="mt-2 font-serif text-2xl">
              Actions enregistrées
            </h2>
          </div>
          <p className="text-sm text-zinc-500">
            {totalEvents} action{totalEvents > 1 ? "s" : ""} · page{" "}
            {currentPage} sur {totalPages}
          </p>
        </div>

        {events.length === 0 ? (
          <EmptyState
            title="Aucune action trouvée"
            description="Modifie ou réinitialise les filtres pour élargir la recherche."
            action={
              <Button href="/admin/history" variant="outline">
                Réinitialiser les filtres
              </Button>
            }
          />
        ) : (
          <ol className="space-y-3">
            {events.map((event) => {
              const contextLabels = getEditorialEventContextLabels(
                event.details,
              );

              return (
                <li
                  key={event.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-950 p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">
                        {getEditorialEventActionLabel(event.action)}
                      </p>
                      {event.article ? (
                        <Link
                          href={`/admin/articles/${event.article.id}`}
                          className="mt-1 block truncate text-sm text-yellow-500 transition hover:text-yellow-400"
                        >
                          #{event.article.id} · {event.article.title}
                        </Link>
                      ) : (
                        <p className="mt-1 text-sm text-zinc-400">
                          Composition de l’accueil
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {event.translation && (
                          <span className="rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
                            Traduction {event.translation.locale}
                          </span>
                        )}
                        {contextLabels.map((label) => (
                          <span
                            key={label}
                            className="rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-300"
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="shrink-0 lg:text-right">
                      {(event.fromStatus || event.toStatus) && (
                        <div className="mb-3 flex items-center gap-2 lg:justify-end">
                          {event.fromStatus && (
                            <EditorialStatusBadge status={event.fromStatus} />
                          )}
                          {event.fromStatus && event.toStatus && (
                            <span className="text-xs text-zinc-600">→</span>
                          )}
                          {event.toStatus && (
                            <EditorialStatusBadge status={event.toStatus} />
                          )}
                        </div>
                      )}
                      <p className="text-xs text-zinc-400">
                        {event.actorEmail}
                      </p>
                      <time
                        dateTime={event.createdAt.toISOString()}
                        className="mt-1 block text-xs text-zinc-600"
                      >
                        {formatEditorialEventDate(event.createdAt)}
                      </time>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        {totalPages > 1 && (
          <nav
            aria-label="Pagination de l’historique"
            className="mt-6 flex items-center justify-between gap-4"
          >
            {currentPage > 1 ? (
              <Button
                href={buildEditorialHistoryHref(filters, currentPage - 1)}
                variant="outline"
              >
                ← Page précédente
              </Button>
            ) : (
              <span />
            )}

            {currentPage < totalPages && (
              <Button
                href={buildEditorialHistoryHref(filters, currentPage + 1)}
                variant="outline"
              >
                Page suivante →
              </Button>
            )}
          </nav>
        )}
      </section>
    </>
  );
}
