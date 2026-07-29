import {
  Button,
  PageHeader,
  StatCard,
} from "@/components/admin/ui";

import { getPublishedArticles } from "@/lib/articles";
import { buildEditorialLayout } from "@/lib/editorial/engine";
import { prisma } from "@/lib/prisma";
import EditorialHealthCard from "@/components/editorial/EditorialHealthCard";
import EditorialHeader from "@/components/editorial/EditorialHeader";
import { buildEditorialPageData } from "@/lib/editorial/buildEditorialPageData";
import EditorialLayout from "@/components/editorial/EditorialLayout";

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


 const {
  hero,
  feature,
  question,
  secondary,
  goodToKnow,
  briefs,
  bottom,
} = buildEditorialPageData({
  editorialLayout,
  publishedArticles,
});

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
      <EditorialLayout
  hero={hero}
  feature={feature}
  question={question}
  secondary={secondary}
  goodToKnow={goodToKnow}
  briefs={briefs}
  bottom={bottom}
  publishedArticles={publishedArticles}
  facebookCount={facebookPublications.length}
  whatsappCount={whatsappPublications.length}
  scheduledCount={scheduledPublications.length}
/>

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