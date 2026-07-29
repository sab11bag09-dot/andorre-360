import {
  Button,
  PageHeader,
  StatCard,
} from "@/components/admin/ui";

import EditorialSlot from "@/components/editorial/EditorialSlot";
import {
  EDITORIAL_ZONE_CONFIG,
  EDITORIAL_ZONES,
} from "@/lib/editorial/zones";
import { getPublishedArticles } from "@/lib/articles";
import { buildEditorialLayout } from "@/lib/editorial/engine";
import { prisma } from "@/lib/prisma";
import EditorialHealthCard from "@/components/editorial/EditorialHealthCard";
import EditorialSocialCard from "@/components/editorial/EditorialSocialCard";
import EditorialHeader from "@/components/editorial/EditorialHeader";

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

  if (editorialLayout.question) {
    usedArticleIds.add(editorialLayout.question.id);
  }

  editorialLayout.goodToKnow.forEach((article) => {
    usedArticleIds.add(article.id);
  });

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

  const question =
    editorialLayout.question ??
    availableArticles.shift() ??
    null;

  const secondary = [...editorialLayout.secondary];

  while (
    secondary.length < EDITORIAL_ZONE_CONFIG.secondary.slots &&
    availableArticles.length > 0
  ) {
    const article = availableArticles.shift();

    if (article) {
      secondary.push(article);
    }
  }

  const goodToKnow = [...editorialLayout.goodToKnow];

  while (
    goodToKnow.length < EDITORIAL_ZONE_CONFIG["good-to-know"].slots &&
    availableArticles.length > 0
  ) {
    const article = availableArticles.shift();

    if (article) {
      goodToKnow.push(article);
    }
  }

  const briefs = [...editorialLayout.briefs];

  while (
   briefs.length < EDITORIAL_ZONE_CONFIG.brief.slots &&
    availableArticles.length > 0
  ) {
    const article = availableArticles.shift();

    if (article) {
      briefs.push(article);
    }
  }

  const bottom =
    editorialLayout.grandFormat ??
    availableArticles.shift() ??
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
  <>
        {/* EN-TÊTE */}

        <PageHeader
          backHref="/admin"
          backLabel="Retour au tableau de bord"
          eyebrow="ANDORRE 360 Studio"
          title="Centre éditorial"
          description="Visualisez la composition du journal, contrôlez les missions actives et préparez les prochaines diffusions depuis un seul cockpit."
          actions={
            <>
              <Button href="/admin/diffusion" variant="outline">
                Missions éditoriales
              </Button>

              <Button href="/admin/articles/nouveau">
                + Nouveau contenu
              </Button>
            </>
          }
        />

        {/* BARRE D’ÉTAT */}

        <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            title="Contenus publiés"
            value={publishedArticles.length}
            description="Tous les contenus actuellement accessibles sur le média."
          />

          <StatCard
            title="Missions actives"
            value={activePublications.length}
            description="Diffusions en cours sur le site et les autres canaux."
          />

          <StatCard
            title="Programmées"
            value={scheduledPublications.length}
            description="Missions dont la diffusion commencera ultérieurement."
          />

          <StatCard
            title="Réseaux sociaux"
            value={
              facebookPublications.length +
              whatsappPublications.length
            }
            description={`${facebookPublications.length} Facebook · ${whatsappPublications.length} WhatsApp`}
          />

          <StatCard
            title="Conflits"
            value={conflicts}
            description={
              conflicts > 0
                ? "Plusieurs contenus occupent certaines zones."
                : "Aucun conflit éditorial détecté."
            }
          />
        </section>

        {/* SANTÉ DU JOURNAL — MAQUETTE TEMPORAIRE */}

        <EditorialHealthCard
  scheduledPublicationsCount={scheduledPublications.length}
/>

        {/* TITRE DE LA COMPOSITION */}

       <EditorialHeader />

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
                title={
  EDITORIAL_ZONE_CONFIG.hero.title ??
  "⭐ Une principale"
}
                article={hero}
                editionKey="home"
                zone={EDITORIAL_ZONES.HERO}
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
                title={
  EDITORIAL_ZONE_CONFIG.feature.title ??
  "🟨 Grande carte"
}
                article={feature}
                editionKey="home"
                zone={EDITORIAL_ZONES.MAIN}
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
  {briefs.filter(Boolean).length}/
  {EDITORIAL_ZONE_CONFIG.brief.slots} occupées
</span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {Array.from({
  length: EDITORIAL_ZONE_CONFIG.brief.slots,
}).map((_,index) => (
                  <EditorialSlot
                    key={`brief-${index}`}
                    title={`${EDITORIAL_ZONE_CONFIG.brief.title ?? "Brève"} ${index + 1}`}
                    article={briefs[index] ?? null}
                    editionKey="home"
                    zone={EDITORIAL_ZONES.BRIEF}
                    compact={EDITORIAL_ZONE_CONFIG.brief.compact}
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
  Zones éditoriales
</h3>
                </div>
              </div>

              <div className="mt-6 space-y-8">

  <div>
    <h4 className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-yellow-700">
      🎙 Question à…
    </h4>

    <EditorialSlot
      title={
  EDITORIAL_ZONE_CONFIG.question.title ??
  "Question à…"
}
      article={question}
      editionKey="home"
      zone={EDITORIAL_ZONES.QUESTION}
      compact={EDITORIAL_ZONE_CONFIG.question.compact}
      articles={publishedArticles}
    />
  </div>

  <div>
    <h4 className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-yellow-700">
      ⭐ Sélection
    </h4>

    <div className="space-y-4">
      {Array.from({
  length: EDITORIAL_ZONE_CONFIG.secondary.slots,
}).map((_, index) => (
        <EditorialSlot
          key={`selection-${index}`}
          title={`${EDITORIAL_ZONE_CONFIG.secondary.title ?? "Sélection"} ${index + 1}`}
          article={secondary[index] ?? null}
          editionKey="home"
          zone={EDITORIAL_ZONES.SECONDARY}
          compact={EDITORIAL_ZONE_CONFIG.secondary.compact}
          articles={publishedArticles}
        />
      ))}
    </div>
  </div>

  <div>
    <h4 className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-yellow-700">
      💡 Bon à savoir
    </h4>

    <div className="space-y-4">
      {Array.from({
  length: EDITORIAL_ZONE_CONFIG["good-to-know"].slots,
}).map((_,index) => (
        <EditorialSlot
          key={`gtk-${index}`}
          title={`${EDITORIAL_ZONE_CONFIG["good-to-know"].title ?? "Bon à savoir"} ${index + 1}`}
          article={goodToKnow[index] ?? null}
          editionKey="home"
          zone={EDITORIAL_ZONES.GOOD_TO_KNOW}
          compact={EDITORIAL_ZONE_CONFIG["good-to-know"].compact}
          articles={publishedArticles}
        />
      ))}
    </div>
  </div>

</div>
            </section>

            {/* ACTIVITÉ SOCIALE */}

            <EditorialSocialCard
  facebookCount={facebookPublications.length}
  whatsappCount={whatsappPublications.length}
  scheduledCount={scheduledPublications.length}
/>

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
              title={
  EDITORIAL_ZONE_CONFIG["grand-format"].title ??
  "📍 Bas de page"
}
              article={bottom}
              editionKey="home"
              zone={EDITORIAL_ZONES.GRAND_FORMAT}
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
       </>
);
}