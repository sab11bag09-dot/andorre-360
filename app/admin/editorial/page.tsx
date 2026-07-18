import Link from "next/link";

import EditorialSlot from "@/components/editorial/EditorialSlot";
import { getPublishedArticles } from "@/lib/articles";
import { buildEditorialLayout } from "@/lib/editorial/engine";
import { prisma } from "@/lib/prisma";

function StatCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: string;
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {label}
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-xl">
          {icon}
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-gray-500">
        {detail}
      </p>
    </article>
  );
}

export default async function EditorialPage() {
  const now = new Date();

  const [
    editorialLayout,
    publishedArticles,
    publications,
  ] = await Promise.all([
    buildEditorialLayout("home"),
    getPublishedArticles(),

    prisma.publication.findMany({
      include: {
        article: true,
      },

      orderBy: [
        {
          priority: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
    }),
  ]);

  /*
   * Les missions éditoriales sont prioritaires.
   * Les articles publiés complètent provisoirement
   * les emplacements encore vides.
   */

  const usedArticleIds = new Set<number>();

  if (editorialLayout.hero) {
    usedArticleIds.add(editorialLayout.hero.id);
  }

 if (editorialLayout.feature) {
  usedArticleIds.add(editorialLayout.feature.id);
}

 editorialLayout.secondary.forEach((article) => {
  usedArticleIds.add(article.id);
});

  editorialLayout.briefs.forEach((article) => {
    usedArticleIds.add(article.id);
  });

  if (editorialLayout.grandFormat) {
  usedArticleIds.add(editorialLayout.grandFormat.id);
}

  const availableArticles = publishedArticles.filter(
    (article) => !usedArticleIds.has(article.id)
  );

  const hero =
    editorialLayout.hero ??
    availableArticles.shift() ??
    null;

  const feature =
  editorialLayout.feature ??
  availableArticles.shift() ??
  null;
    

  const secondary = [...editorialLayout.secondary];

 while (
  secondary.length < 3 &&
  availableArticles.length > 0
) {
  const article = availableArticles.shift();

  if (article) {
    secondary.push(article);
  }
}

  const briefs = [...editorialLayout.briefs];

  while (
    briefs.length < 3 &&
    availableArticles.length > 0
  ) {
    const article = availableArticles.shift();

    if (article) {
      briefs.push(article);
    }
  }

  const bottom =
  editorialLayout.grandFormat ??
  availableArticles[availableArticles.length - 1] ??
  null;

  /*
   * Indicateurs du Centre éditorial.
   */

  const activePublications = publications.filter(
    (publication) => {
      if (!publication.active) {
        return false;
      }

      if (
        publication.startsAt &&
        publication.startsAt > now
      ) {
        return false;
      }

      if (
        publication.endsAt &&
        publication.endsAt < now
      ) {
        return false;
      }

      return true;
    }
  );

  const scheduledPublications = publications.filter(
    (publication) =>
      publication.active &&
      publication.startsAt !== null &&
      publication.startsAt > now
  );

  const facebookPublications =
    activePublications.filter(
      (publication) =>
        publication.channel === "facebook"
    );

  const whatsappPublications =
    activePublications.filter(
      (publication) =>
        publication.channel === "whatsapp"
    );

  /*
   * Détection simple des conflits :
   * plusieurs missions actives dans une même zone.
   */

  const publicationGroups = new Map<string, number>();

  activePublications.forEach((publication) => {
    const key = [
      publication.pageKey,
      publication.channel,
      publication.zone,
    ].join(":");

    publicationGroups.set(
      key,
      (publicationGroups.get(key) ?? 0) + 1
    );
  });

  const conflicts = Array.from(
    publicationGroups.values()
  ).filter((count) => count > 1).length;

  return (
    <main className="min-h-screen bg-[#f5f4f0] text-gray-900">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* EN-TÊTE */}

        <header className="rounded-3xl bg-black px-7 py-8 text-white shadow-xl md:px-10">
          <div className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
            <div>
              <Link
                href="/admin"
                className="text-sm font-semibold text-yellow-400 transition hover:text-yellow-300"
              >
                ← Retour au tableau de bord
              </Link>

              <p className="mt-8 text-xs font-semibold uppercase tracking-[0.3em] text-yellow-500">
                ANDORRE 360 STUDIO
              </p>

              <h1 className="mt-3 font-serif text-4xl md:text-6xl">
                Centre éditorial
              </h1>

              <p className="mt-4 max-w-2xl leading-relaxed text-gray-300">
                Visualisez la composition du journal,
                contrôlez les missions actives et préparez les
                prochaines diffusions depuis un seul cockpit.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/diffusion"
                className="rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold transition hover:bg-white/10"
              >
                Missions éditoriales
              </Link>

              <Link
                href="/admin/articles/nouveau"
                className="rounded-xl bg-yellow-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-yellow-400"
              >
                + Nouveau contenu
              </Link>
            </div>
          </div>
        </header>

        {/* BARRE D’ÉTAT */}

        <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            icon="📰"
            label="Contenus publiés"
            value={publishedArticles.length}
            detail="Tous les contenus actuellement accessibles sur le média."
          />

          <StatCard
            icon="🟢"
            label="Missions actives"
            value={activePublications.length}
            detail="Diffusions en cours sur le site et les autres canaux."
          />

          <StatCard
            icon="📅"
            label="Programmées"
            value={scheduledPublications.length}
            detail="Missions dont la diffusion commencera ultérieurement."
          />

          <StatCard
            icon="📣"
            label="Réseaux sociaux"
            value={
              facebookPublications.length +
              whatsappPublications.length
            }
            detail={`${facebookPublications.length} Facebook · ${whatsappPublications.length} WhatsApp`}
          />

          <StatCard
            icon={conflicts > 0 ? "⚠️" : "✅"}
            label="Conflits"
            value={conflicts}
            detail={
              conflicts > 0
                ? "Plusieurs contenus occupent certaines zones."
                : "Aucun conflit éditorial détecté."
            }
          />
        </section>

        {/* SANTÉ DU JOURNAL — MAQUETTE TEMPORAIRE */}

        <section className="mt-8 rounded-3xl bg-gradient-to-r from-emerald-600 to-emerald-700 p-8 text-white shadow-xl">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-100">
                Santé du journal
              </p>

              <h2 className="mt-3 font-serif text-4xl">
                Indice éditorial global
              </h2>

              <p className="mt-3 max-w-xl text-emerald-100">
                Une première représentation visuelle de la
                santé éditoriale. Les valeurs seront ensuite
                calculées à partir des vraies statistiques.
              </p>
            </div>

            <div className="text-center">
              <div className="text-7xl font-black">
                84
              </div>

              <p className="mt-2 text-xl font-semibold">
                /100
              </p>

              <div className="mt-5 inline-flex rounded-full bg-white/20 px-5 py-2 text-sm font-bold">
                🟢 Excellent
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-5">
              <p className="text-3xl font-bold">
                3
              </p>

              <p className="mt-2 text-sm">
                Contenus très performants
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-5">
              <p className="text-3xl font-bold">
                1
              </p>

              <p className="mt-2 text-sm">
                Contenu à surveiller
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-5">
              <p className="text-3xl font-bold">
                {scheduledPublications.length}
              </p>

              <p className="mt-2 text-sm">
                Publications programmées
              </p>
            </div>
          </div>
        </section>

        {/* TITRE DE LA COMPOSITION */}

        <section className="mt-10 flex flex-col gap-4 border-b border-gray-300 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-700">
              Composition en direct
            </p>

            <h2 className="mt-2 font-serif text-3xl md:text-4xl">
              Page d’accueil
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              Les missions éditoriales priment sur le
              remplissage automatique.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold shadow-sm transition hover:border-yellow-500"
          >
            Voir la homepage →
          </Link>
        </section>

        {/* COMPOSITION DU JOURNAL */}

        <section className="mt-7 grid gap-7 lg:grid-cols-3">
          {/* PARTIE PRINCIPALE */}

          <div className="space-y-7 lg:col-span-2">
            {/* UNE PRINCIPALE */}

            <div>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-yellow-700">
                    Zone prioritaire
                  </p>

                  <h3 className="mt-1 font-serif text-2xl">
                    Une principale
                  </h3>
                </div>

                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                  ACTIF
                </span>
              </div>

              <EditorialSlot
                title="⭐ Une principale"
                article={hero}
                editionKey="home"
                zone="hero"
                articles={publishedArticles}
              />
            </div>

            {/* GRANDE CARTE */}

            <div>
              <div className="mb-3">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-yellow-700">
                  Zone centrale
                </p>

                <h3 className="mt-1 font-serif text-2xl">
                  Grande carte
                </h3>
              </div>

              <EditorialSlot
                title="🟨 Grande carte"
                article={feature}
                editionKey="home"
                zone="main"
                articles={publishedArticles}
              />
            </div>

            {/* BRÈVES */}

            <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-yellow-700">
                    Lecture rapide
                  </p>

                  <h3 className="mt-1 font-serif text-2xl">
                    Brèves
                  </h3>
                </div>

                <span className="text-sm text-gray-500">
                  {briefs.filter(Boolean).length}/3 occupées
                </span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {[0, 1, 2].map((index) => (
                  <EditorialSlot
                    key={`brief-${index}`}
                    title={`Brève ${index + 1}`}
                    article={briefs[index] ?? null}
                    editionKey="home"
                    zone="brief"
                    compact
                    articles={publishedArticles}
                  />
                ))}
              </div>
            </section>
          </div>

          {/* COLONNE DROITE */}

          <aside className="space-y-7">
            <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="border-b border-gray-200 pb-5">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-yellow-700">
                  Zone verticale
                </p>

                <div className="mt-1 flex items-center justify-between">
                  <h3 className="font-serif text-2xl">
                    Colonne de droite
                  </h3>

                  <span className="text-sm text-gray-500">
                    {secondary.filter(Boolean).length}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                {[0, 1, 2].map((index) => (
                  <EditorialSlot
                    key={`column-${index}`}
                    title={`Carte ${index + 1}`}
                    article={secondary[index] ?? null}
                    editionKey="home"
                    zone="secondary"
                    compact
                    articles={publishedArticles}
                  />
                ))}
              </div>
            </section>

            {/* ACTIVITÉ SOCIALE */}

            <section className="rounded-3xl bg-[#161616] p-6 text-white shadow-lg">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-yellow-500">
                Diffusion sociale
              </p>

              <h3 className="mt-2 font-serif text-2xl">
                Réseaux sociaux
              </h3>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-white/5 p-4">
                  <span>Facebook</span>

                  <strong className="text-yellow-400">
                    {facebookPublications.length}
                  </strong>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-white/5 p-4">
                  <span>WhatsApp</span>

                  <strong className="text-yellow-400">
                    {whatsappPublications.length}
                  </strong>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-white/5 p-4">
                  <span>Programmées</span>

                  <strong className="text-yellow-400">
                    {scheduledPublications.length}
                  </strong>
                </div>
              </div>

              <Link
                href="/admin/diffusion"
                className="mt-6 block rounded-xl bg-white px-4 py-3 text-center text-sm font-semibold text-black transition hover:bg-yellow-400"
              >
                Piloter les diffusions
              </Link>
            </section>
          </aside>
        </section>

        {/* PIED DE PAGE ÉDITORIAL */}

        <section className="mt-10 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex flex-col gap-3 border-b border-gray-200 pb-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-yellow-700">
                Dernière mise en avant
              </p>

              <h3 className="mt-1 font-serif text-2xl">
                Carte de bas de page
              </h3>
            </div>

            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
              CYCLE ÉDITORIAL
            </span>
          </div>

          <div className="mx-auto max-w-4xl">
            <EditorialSlot
              title="📍 Bas de page"
              article={bottom}
              editionKey="home"
              zone="grand-format"
              articles={publishedArticles}
            />
          </div>
        </section>

        {/* NOTE DE FONCTIONNEMENT */}

        <footer className="mt-8 rounded-2xl border border-yellow-200 bg-yellow-50 px-6 py-5">
          <p className="text-sm leading-relaxed text-yellow-900">
            <strong>Principe du Studio :</strong> lorsqu’un
            contenu quitte une zone prioritaire, il reste
            publié, accessible dans sa rubrique et disponible
            dans les archives. Il change de visibilité, mais ne
            disparaît jamais.
          </p>
        </footer>
      </div>
    </main>
  );
}