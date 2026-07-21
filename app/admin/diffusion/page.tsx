import Link from "next/link";

import { prisma } from "@/lib/prisma";

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
  if (priority >= 30) return "Urgente";
  if (priority >= 20) return "Prioritaire";
  if (priority >= 10) return "Importante";

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
    (publication) => publication.active
  );

  const inactivePublications = publications.filter(
    (publication) => !publication.active
  );

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10 text-gray-900">
      <div className="mx-auto max-w-7xl">
        {/* EN-TÊTE */}

        <div className="flex flex-col gap-6 border-b border-gray-300 pb-8 md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              href="/admin"
              className="text-sm font-semibold text-yellow-700 hover:text-yellow-600"
            >
              ← Retour au tableau de bord
            </Link>

            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.25em] text-yellow-600">
              ANDORRE 360 Studio
            </p>

            <h1 className="mt-2 font-serif text-4xl md:text-5xl">
              Diffusion éditoriale
            </h1>

            <p className="mt-3 max-w-2xl text-gray-600">
              Pilotez les emplacements, les canaux et les priorités
              des contenus du média.
            </p>
          </div>

          <Link
            href="/admin/articles/nouveau"
            className="rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-yellow-600"
          >
            + Nouveau contenu
          </Link>
        </div>

        {/* INDICATEURS */}

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Missions actives
            </p>

            <p className="mt-3 text-4xl font-bold">
              {activePublications.length}
            </p>
          </article>

          <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Zones utilisées
            </p>

            <p className="mt-3 text-4xl font-bold">
              {
                new Set(
                  activePublications.map(
                    (publication) => publication.zone
                  )
                ).size
              }
            </p>
          </article>

          <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Missions inactives
            </p>

            <p className="mt-3 text-4xl font-bold">
              {inactivePublications.length}
            </p>
          </article>
        </section>

        {/* MISSIONS ACTIVES */}

        <section className="mt-10 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-5">
            <h2 className="font-serif text-2xl">
              Missions actives
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Les contenus actuellement diffusés par le Studio.
            </p>
          </div>

          {activePublications.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              Aucune mission éditoriale active.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {activePublications.map((publication) => (
                <article
                  key={publication.id}
                  className="grid gap-5 px-6 py-6 lg:grid-cols-[1fr_180px_170px_130px]"
                >
                  <div>
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
                      <Link
                        href={`/article/${publication.article.slug}`}
                        className="rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100"
                      >
                        Voir
                      </Link>

                      <Link
                        href={`/admin/articles/${publication.article.id}`}
                        className="rounded-md bg-black px-3 py-2 text-sm text-white hover:bg-yellow-600"
                      >
                        Éditer
                      </Link>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-400">
                      Zone
                    </p>

                    <p className="mt-2 font-semibold">
                      {getZoneLabel(publication.zone)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-400">
                      Canal
                    </p>

                    <p className="mt-2 font-semibold">
                      {getChannelLabel(publication.channel)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-400">
                      Priorité
                    </p>

                    <p className="mt-2 font-semibold">
                      {getPriorityLabel(publication.priority)}
                    </p>
                  </div>

                  <div className="lg:col-span-4 grid gap-4 rounded-lg bg-gray-50 p-4 text-sm md:grid-cols-2">
                    <div>
                      <span className="text-gray-500">
                        Début :
                      </span>{" "}
                      {formatDate(publication.startsAt)}
                    </div>

                    <div>c
                      <span className="text-gray-500">
                        Fin :
                      </span>{" "}
                      {formatDate(publication.endsAt)}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}