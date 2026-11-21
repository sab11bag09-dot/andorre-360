import {
  Badge,
  Button,
  DataTable,
  DataTableRow,
  EmptyState,
  Input,
  PageHeader,
  SectionHeader,
  Select,
  StatCard,
} from "@/components/admin/ui";
import {
  SourceAvailabilityStatus,
  SourceCollectionMode,
  SourcePublicationMode,
} from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  getSourceCollectionIssues,
  loadRecentDateStats,
  type SourceCollectionIssue,
} from "@/lib/sources/collectionHealth";
import {
  COLLECTION_MODES,
  getOptionLabel,
  ORGANIZATION_TYPES,
  PUBLICATION_MODES,
} from "@/lib/sources/constants";
import {
  checkSourceAvailability,
  collectSourceNow,
  toggleSource,
} from "@/app/admin/sources/actions";

const SOURCE_GRID_TEMPLATE =
  "minmax(0, 2fr) 150px 140px 140px 110px 260px";

function formatDate(date: Date | null) {
  if (!date) {
    return "Jamais";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getAvailabilityBadge(
  status: SourceAvailabilityStatus,
) {
  switch (status) {
    case SourceAvailabilityStatus.AVAILABLE:
      return <Badge variant="success">Disponible</Badge>;

    case SourceAvailabilityStatus.UNAVAILABLE:
      return <Badge>Indisponible</Badge>;

    case SourceAvailabilityStatus.UNKNOWN:
    default:
      return <Badge>Non vérifiée</Badge>;
  }
}

function getIssueBadge(issue: SourceCollectionIssue) {
  return (
    <Badge
      key={issue.kind}
      variant={issue.kind === "error" ? "danger" : "warning"}
    >
      {issue.label}
    </Badge>
  );
}

function isCollectionMode(
  value: string,
): value is SourceCollectionMode {
  return COLLECTION_MODES.some(
    (option) => option.value === value,
  );
}

function isPublicationMode(
  value: string,
): value is SourcePublicationMode {
  return PUBLICATION_MODES.some(
    (option) => option.value === value,
  );
}

export default async function AdminSourcesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    collection?: string;
    publication?: string;
  }>;
}) {
  const filters = await searchParams;

  const query = filters.q?.trim() ?? "";
  const status = filters.status ?? "all";
  const collection = filters.collection ?? "all";
  const publication = filters.publication ?? "all";

  const sources = await prisma.source.findMany({
    where: {
      AND: [
        query
          ? {
              OR: [
                {
                  name: {
                    contains: query,
                  },
                },
                {
                  url: {
                    contains: query,
                  },
                },
                {
                  category: {
                    contains: query,
                  },
                },
              ],
            }
          : {},
        status === "active"
          ? {
              active: true,
            }
          : status === "inactive"
            ? {
                active: false,
              }
            : {},
        collection !== "all" &&
        isCollectionMode(collection)
          ? {
              collectionMode: collection,
            }
          : {},
        publication !== "all" &&
        isPublicationMode(publication)
          ? {
              publicationMode: publication,
            }
          : {},
      ],
    },
    orderBy: [
      {
        active: "desc",
      },
      {
        name: "asc",
      },
    ],
  });

  const totalCount = await prisma.source.count();

  const activeCount = await prisma.source.count({
    where: {
      active: true,
    },
  });

  const autoCount = await prisma.source.count({
    where: {
      publicationMode: SourcePublicationMode.AUTO,
    },
  });

  // Les alertes portent sur toutes les sources actives, pas seulement
  // sur celles que le filtre affiche.
  const [recentDateStats, activeSources] = await Promise.all([
    loadRecentDateStats(prisma),
    prisma.source.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        active: true,
        availabilityStatus: true,
        lastErrorAt: true,
        lastSuccessAt: true,
        lastErrorMessage: true,
      },
    }),
  ]);

  const sourcesToWatch = activeSources
    .map((source) => ({
      source,
      issues: getSourceCollectionIssues(
        source,
        recentDateStats.get(source.id),
      ),
    }))
    .filter(({ issues }) => issues.length > 0);

  const visibleSources =
    status === "issues"
      ? sources.filter((source) =>
          sourcesToWatch.some(({ source: watched }) => watched.id === source.id),
        )
      : sources;

  return (
    <>
      <PageHeader
        backHref="/admin"
        backLabel="Retour au tableau de bord"
        eyebrow="ANDORRE 360 Studio"
        title="Sources"
        description="Gère les organismes et les flux qui alimenteront la Veille et le Fil Info."
        actions={
          <Button href="/admin/sources/nouveau">
            Ajouter une source
          </Button>
        }
      />

      <section className="grid gap-4 py-8 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Sources" value={totalCount} />

        <StatCard title="Actives" value={activeCount} />

        <StatCard
          title="Publication automatique"
          value={autoCount}
        />

        <StatCard
          title="À surveiller"
          value={sourcesToWatch.length}
          description="En erreur ou sans date"
          valueClassName={
            sourcesToWatch.length > 0 ? "text-red-400" : undefined
          }
          href="/admin/sources?status=issues"
        />
      </section>

      {sourcesToWatch.length > 0 ? (
        <section
          aria-labelledby="sources-a-surveiller"
          className="mb-8 rounded-xl border border-red-500/30 bg-red-500/5 p-5"
        >
          <h2
            id="sources-a-surveiller"
            className="font-semibold text-red-300"
          >
            {sourcesToWatch.length} source
            {sourcesToWatch.length > 1 ? "s" : ""} active
            {sourcesToWatch.length > 1 ? "s" : ""} à surveiller
          </h2>

          <ul className="mt-4 space-y-3">
            {sourcesToWatch.map(({ source, issues }) => (
              <li key={source.id} className="min-w-0 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={`/admin/sources/${source.id}`}
                    className="font-medium text-white transition hover:text-yellow-500"
                  >
                    {source.name}
                  </a>
                  {issues.map(getIssueBadge)}
                </div>

                {issues
                  .filter((issue) => issue.detail)
                  .map((issue) => (
                    <p
                      key={issue.kind}
                      className="mt-1 break-words text-xs text-zinc-400"
                    >
                      {issue.detail}
                    </p>
                  ))}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="border-t border-zinc-800 py-8">
        <form className="grid gap-4 rounded-xl border border-zinc-800 bg-zinc-950 p-5 md:grid-cols-4">
          <Input
            name="q"
            defaultValue={query}
            placeholder="Rechercher une source…"
            className="mt-0 bg-black"
          />

          <Select
            name="status"
            defaultValue={status}
            className="mt-0 bg-black"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actives</option>
            <option value="inactive">Inactives</option>
            <option value="issues">À surveiller</option>
          </Select>

          <Select
            name="collection"
            defaultValue={collection}
            className="mt-0 bg-black"
          >
            <option value="all">
              Toutes les collectes
            </option>

            {COLLECTION_MODES.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </Select>

          <div className="flex gap-2">
            <Select
              name="publication"
              defaultValue={publication}
              className="mt-0 min-w-0 flex-1 bg-black"
            >
              <option value="all">
                Toutes les publications
              </option>

              {PUBLICATION_MODES.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </Select>

            <Button type="submit" variant="secondary">
              Filtrer
            </Button>
          </div>
        </form>
      </section>

      <SectionHeader
        title="Sources enregistrées"
        description={`${visibleSources.length} résultat${
          visibleSources.length > 1 ? "s" : ""
        }`}
      />

      <section>
        {visibleSources.length === 0 ? (
          <EmptyState
            title="Aucune source"
            description="Ajoute la première source que la Veille devra surveiller."
            action={
              <Button href="/admin/sources/nouveau">
                Ajouter une source
              </Button>
            }
          />
        ) : (
          <DataTable
            columns={[
              {
                key: "source",
                label: "Source",
              },
              {
                key: "organization",
                label: "Organisation",
              },
              {
                key: "collection",
                label: "Collecte",
              },
              {
                key: "publication",
                label: "Publication",
              },
              {
                key: "status",
                label: "Statut",
              },
              {
                key: "actions",
                label: "Actions",
                align: "right",
              },
            ]}
            gridTemplateColumns={SOURCE_GRID_TEMPLATE}
          >
            {visibleSources.map((source) => {
              const issues = getSourceCollectionIssues(
                source,
                recentDateStats.get(source.id),
              );
              const toggleAction = toggleSource.bind(
                null,
                source.id,
              );

              const checkAction =
                checkSourceAvailability.bind(
                  null,
                  source.id,
                );
                const collectAction =
  collectSourceNow.bind(
    null,
    source.id,
  );

              return (
                <DataTableRow
                  key={source.id}
                  className="py-5 transition hover:bg-zinc-900/70"
                >
                  <div className="min-w-0">
                    <h2 className="font-medium text-white">
                      {source.name}
                    </h2>

                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 block truncate text-xs text-zinc-600 transition hover:text-yellow-500"
                    >
                      {source.url}
                    </a>

                    <p className="mt-2 text-xs text-zinc-600">
                      Dernier contrôle :{" "}
                      {formatDate(source.lastCheckedAt)}
                    </p>
                    <p className="mt-1 text-xs text-zinc-600">
  Dernier succès :{" "}
  {formatDate(source.lastSuccessAt)}
</p>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {getAvailabilityBadge(
                        source.availabilityStatus,
                      )}

                      {issues.map(getIssueBadge)}

                      {source.lastErrorMessage ? (
                        <span
                          className="max-w-full truncate text-xs text-red-400"
                          title={source.lastErrorMessage}
                        >
                          {source.lastErrorMessage}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <p className="text-sm text-zinc-300">
                    {getOptionLabel(
                      ORGANIZATION_TYPES,
                      source.organizationType,
                    )}
                  </p>

                  <p className="text-sm text-zinc-400">
                    {getOptionLabel(
                      COLLECTION_MODES,
                      source.collectionMode,
                    )}
                  </p>

                  <p className="text-sm text-zinc-400">
                    {getOptionLabel(
                      PUBLICATION_MODES,
                      source.publicationMode,
                    )}
                  </p>

                  <div>
                    {source.active ? (
                      <Badge variant="success">
                        Active
                      </Badge>
                    ) : (
                      <Badge>Inactive</Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 xl:justify-end">
  <form action={checkAction}>
    <Button
      type="submit"
      variant="outline"
    >
      Vérifier
    </Button>
  </form>
<form action={collectAction}>
  <Button
    type="submit"
    variant="outline"
  >
    Collecter
  </Button>
</form>

  <Button
    href={`/admin/sources/${source.id}`}
    variant="outline"
  >

    Modifier
  </Button>

  <form action={toggleAction}>
    <Button
      type="submit"
      variant="outline"
    >
      {source.active ? "Désactiver" : "Activer"}
    </Button>
  </form>
</div>
                </DataTableRow>
              );
            })}
          </DataTable>
        )}
      </section>
    </>
  );
}