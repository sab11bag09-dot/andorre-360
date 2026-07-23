import {
  Button,
  DataTable,
  DataTableRow,
  EmptyState,
  PageHeader,
  SectionHeader,
  StatCard,
} from "@/components/admin/ui";
import { prisma } from "@/lib/prisma";

const PUBLICATION_GRID_TEMPLATE =
  "minmax(0, 1fr) 180px 170px 130px";

function formatDate(date: Date | null): string {
  if (!date) {
    return "Non définie";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getZoneLabel(zone: string): string {
  const labels: Record<string, string> = {
    hero: "Une principale",
    main: "Grande carte",
    secondary: "Carte secondaire",
    column: "Colonne de droite",
    brief: "Brève",
    bottom: "Carte de bas de page",
    standard: "Article standard",
  };

  return labels[zone] ?? zone;
}

function getChannelLabel(channel: string): string {
  const labels: Record<string, string> = {
    site: "Site ANDORRE 360",
    facebook: "Facebook",
    whatsapp: "WhatsApp",
    newsletter: "Newsletter",
  };

  return labels[channel] ?? channel;
}

function getPriorityLabel(priority: number): string {
  if (priority >= 30) {
    return "Urgente";
  }

  if (priority >= 20) {
    return "Prioritaire";
  }

  if (priority >= 10) {
    return "Importante";
  }

  return "Normale";
}

export default async function DiffusionPage() {
  const publications = await prisma.publication.findMany({
    include: {
      article: true,
    },
    orderBy: [
      {
        active: "desc",
      },
      {
        priority: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
  });

  const activePublications = publications.filter(
    (publication) => publication.active,
  );

  const inactivePublications = publications.filter(
    (publication) => !publication.active,
  );

  const usedZonesCount = new Set(
    activePublications.map(
      (publication) => publication.zone,
    ),
  ).size;

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10 text-gray-900">
      <div className="mx-auto max-w-7xl">
        <PageHeader
          backHref="/admin"
          backLabel="Retour au tableau de bord"
          eyebrow="ANDORRE 360 Studio"
          title="Diffusion éditoriale"
          description="Pilotez les emplacements, les canaux et les priorités des contenus du média."
          actions={
            <Button href="/admin/articles/nouveau">
              Nouveau contenu
            </Button>
          }
        />

        <section className="grid gap-5 py-8 md:grid-cols-3">
          <StatCard
            title="Missions actives"
            value={activePublications.length}
          />

          <StatCard
            title="Zones utilisées"
            value={usedZonesCount}
          />

          <StatCard
            title="Missions inactives"
            value={inactivePublications.length}
          />
        </section>

        <SectionHeader
          title="Missions actives"
          description="Les contenus actuellement diffusés par le Studio."
        />

        <section>
          {activePublications.length === 0 ? (
            <EmptyState
              title="Aucune mission active"
              description="Aucune mission éditoriale n’est actuellement diffusée par le Studio."
              action={
                <Button href="/admin/articles/nouveau">
                  Nouveau contenu
                </Button>
              }
            />
          ) : (
            <DataTable
              columns={[
                {
                  key: "article",
                  label: "Article",
                },
                {
                  key: "zone",
                  label: "Zone",
                },
                {
                  key: "channel",
                  label: "Canal",
                },
                {
                  key: "priority",
                  label: "Priorité",
                },
              ]}
              gridTemplateColumns={
                PUBLICATION_GRID_TEMPLATE
              }
            >
              {activePublications.map((publication) => (
                <DataTableRow
                  key={publication.id}
                  className="items-start py-6"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-widest text-yellow-600">
                      {publication.article.category}
                    </p>

                    <h3 className="mt-2 font-semibold">
                      {publication.article.title}
                    </h3>

                    <p className="mt-2 text-sm text-gray-500">
                      Par {publication.article.author}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <Button
                        href={`/article/${publication.article.slug}`}
                        variant="outline"
                      >
                        Voir
                      </Button>

                      <Button
                        href={`/admin/articles/${publication.article.id}`}
                      >
                        Éditer
                      </Button>
                    </div>

                    <div className="mt-4 grid gap-3 rounded-lg bg-gray-50 p-4 text-sm md:grid-cols-2">
                      <div>
                        <span className="text-gray-500">
                          Début :
                        </span>{" "}
                        {formatDate(
                          publication.startsAt,
                        )}
                      </div>

                      <div>
                        <span className="text-gray-500">
                          Fin :
                        </span>{" "}
                        {formatDate(
                          publication.endsAt,
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="font-semibold">
                    {getZoneLabel(publication.zone)}
                  </p>

                  <p className="font-semibold">
                    {getChannelLabel(
                      publication.channel,
                    )}
                  </p>

                  <p className="font-semibold">
                    {getPriorityLabel(
                      publication.priority,
                    )}
                  </p>
                </DataTableRow>
              ))}
            </DataTable>
          )}
        </section>
      </div>
    </main>
  );
}