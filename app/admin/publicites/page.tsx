import AdvertisementForm from "@/components/admin/AdvertisementForm";
import {
  deleteAdvertisementAction,
  setAdvertisementActiveAction,
} from "@/actions/advertisements";
import {
  Button,
  PageHeader,
  SectionHeader,
} from "@/components/admin/ui";
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

function getFormatLabel(format: string): string {
  return format === "FOUR_COLUMNS"
    ? "4 colonnes"
    : "2 colonnes + une carte";
}

export default async function AdvertisementsPage() {
  const advertisements =
    await prisma.advertisement.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

  return (
    <>
      <PageHeader
        backHref="/admin"
        backLabel="Retour au Studio"
        eyebrow="ANDORRE 360 Studio"
        title="Publicités"
        description="Gérez les publicités affichées uniquement sur la page Actualité."
        actions={
          <Button href="/actualite" variant="outline">
            Voir Actualité
          </Button>
        }
      />

      <section className="grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <AdvertisementForm />

        <div>
          <SectionHeader
            title="Publicités enregistrées"
            description={`${advertisements.length} publicité${
              advertisements.length > 1 ? "s" : ""
            }`}
          />

          <div className="space-y-4">
            {advertisements.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-700 p-8 text-center text-zinc-400">
                Aucune publicité enregistrée.
              </div>
            ) : (
              advertisements.map((advertisement) => (
                <article
                  key={advertisement.id}
                  className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
                >
                  <div className="relative h-40 bg-zinc-800">
                    <img
                      src={advertisement.imagePath}
                      alt="Publicité"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="space-y-4 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-yellow-500">
                          {getFormatLabel(advertisement.format)}
                        </p>

                        <p className="mt-2 break-all text-sm text-zinc-400">
                          {advertisement.targetUrl}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          advertisement.active
                            ? "bg-emerald-950 text-emerald-300"
                            : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        {advertisement.active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </div>

                    <div className="text-sm text-zinc-400">
                      Du {formatDate(advertisement.startsAt)}
                      {" · "}
                      au {formatDate(advertisement.endsAt)}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <form
                        action={setAdvertisementActiveAction.bind(
                          null,
                          advertisement.id,
                          !advertisement.active,
                        )}
                      >
                        <button
                          type="submit"
                          className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-400"
                        >
                          {advertisement.active
                            ? "Désactiver"
                            : "Activer"}
                        </button>
                      </form>

                      <form
                        action={deleteAdvertisementAction.bind(
                          null,
                          advertisement.id,
                        )}
                      >
                        <button
                          type="submit"
                          className="rounded-lg border border-red-900 px-4 py-2 text-sm font-semibold text-red-300 hover:border-red-500 hover:text-red-200"
                        >
                          Supprimer
                        </button>
                      </form>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
}