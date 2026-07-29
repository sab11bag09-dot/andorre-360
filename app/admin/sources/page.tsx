import { toggleSource } from "@/app/admin/sources/actions";
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
  SourceCollectionMode,
  SourcePublicationMode,
} from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  COLLECTION_MODES,
  getOptionLabel,
  ORGANIZATION_TYPES,
  PUBLICATION_MODES,
} from "@/lib/sources/constants";

const SOURCE_GRID_TEMPLATE =
  "minmax(0, 2fr) 150px 140px 140px 110px 180px";

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

      <section className="grid gap-4 py-8 sm:grid-cols-3">
        <StatCard title="Sources" value={totalCount} />

        <StatCard title="Actives" value={activeCount} />

        <StatCard
          title="Publication automatique"
          value={autoCount}
        />
      </section>

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
        description={`${sources.length} résultat${
          sources.length > 1 ? "s" : ""
        }`}
      />

      <section>
        {sources.length === 0 ? (
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
            {sources.map((source) => {
              const toggleAction = toggleSource.bind(
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

                  <div className="flex flex-wrap gap-2 xl:justify-end">
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
                        {source.active
                          ? "Désactiver"
                          : "Activer"}
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