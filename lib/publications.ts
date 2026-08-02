import { prisma } from "@/lib/prisma";
import { PUBLIC_ARTICLE_FILTER } from "@/lib/public-article";

type HomepageZone =
  | "hero"
  | "main"
  | "secondary"
  | "column"
  | "brief"
  | "bottom";

function isPublicationActive(
  startsAt: Date | null,
  endsAt: Date | null
): boolean {
  const now = new Date();

  if (startsAt && startsAt > now) {
    return false;
  }

  if (endsAt && endsAt < now) {
    return false;
  }

  return true;
}

export async function getHomepagePublications() {
  const publications = await prisma.publication.findMany({
    where: {
      active: true,
      channel: "site",
      article: {
        ...PUBLIC_ARTICLE_FILTER,
      },
      zone: {
        in: [
          "hero",
          "main",
          "secondary",
          "column",
          "brief",
          "bottom",
        ],
      },
    },
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
  });

  const activePublications = publications.filter(
    (publication) =>
      isPublicationActive(
        publication.startsAt,
        publication.endsAt
      )
  );

  const byZone = (zone: HomepageZone) =>
    activePublications.filter(
      (publication) => publication.zone === zone
    );

  return {
    hero: byZone("hero")[0]?.article ?? null,
    main: byZone("main")[0]?.article ?? null,
    secondary: byZone("secondary").map(
      (publication) => publication.article
    ),
    column: byZone("column").map(
      (publication) => publication.article
    ),
    briefs: byZone("brief").map(
      (publication) => publication.article
    ),
    bottom: byZone("bottom")[0]?.article ?? null,
  };
}
