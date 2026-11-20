import HomePageView from "@/components/home/HomePageView";
import { getPublishedArticles } from "@/lib/articles";
import { composeHomePage } from "@/lib/editorial/composeHomePage";
import { buildEditorialLayout } from "@/lib/editorial/engine";
import { prisma } from "@/lib/prisma";

/** Page d’accueil : charge les placements et les articles, puis délègue l’affichage. */
export default async function HomePageEditorial() {
  const [editorialLayout, publishedArticles, activeAutomatedPublicationCount] =
    await Promise.all([
      buildEditorialLayout("home"),
      getPublishedArticles(),
      prisma.publication.count({
        where: {
          pageKey: "home",
          channel: "site",
          active: true,
          locked: false,
          origin: {
            in: ["AUTOMATED", "FALLBACK"],
          },
          automationRunId: {
            not: null,
          },
        },
      }),
    ]);

  const home = composeHomePage(editorialLayout, publishedArticles, {
    hasActiveAutomatedComposition: activeAutomatedPublicationCount > 0,
  });

  return <HomePageView home={home} />;
}
