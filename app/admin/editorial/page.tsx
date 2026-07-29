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

import { buildEditorialStats } from "@/lib/editorial/buildEditorialStats";
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
const {
  activePublications,
  scheduledPublications,
  facebookPublications,
  whatsappPublications,
  conflicts,
} = buildEditorialStats({
  publications,
  now,
});
  /*
   * Indicateurs du Centre éditorial.
   */



  /*
   * Détection simple des conflits :
   * plusieurs missions actives dans une même zone.
   */



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