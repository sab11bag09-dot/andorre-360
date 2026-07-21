import { prisma } from "@/lib/prisma";

import {
  EDITORIAL_ZONES,
  type EditorialZone,
} from "@/lib/editorial/zones";

function isActivePublication(
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

export async function buildEditorialLayout(pageKey: string) {
  const publications = await prisma.publication.findMany({
    where: {
      pageKey,
      channel: "site",
      active: true,
      article: {
        published: true,
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
      isActivePublication(
        publication.startsAt,
        publication.endsAt
      )
  );

  const getZone = (zone: EditorialZone) =>
    activePublications.filter(
      (publication) => publication.zone === zone
    );

  return {
    hero:
      getZone(EDITORIAL_ZONES.HERO)[0]?.article ?? null,

    feature:
      getZone(EDITORIAL_ZONES.FEATURE)[0]?.article ?? null,

    secondary: getZone(
      EDITORIAL_ZONES.SECONDARY
    ).map((publication) => publication.article),

    card: getZone(EDITORIAL_ZONES.CARD).map(
      (publication) => publication.article
    ),

    briefs: getZone(EDITORIAL_ZONES.BRIEF).map(
      (publication) => publication.article
    ),

    grandFormat:
      getZone(EDITORIAL_ZONES.GRAND_FORMAT)[0]?.article ??
      null,

    question:
      getZone(EDITORIAL_ZONES.QUESTION)[0]?.article ??
      null,

    goodToKnow: getZone(
      EDITORIAL_ZONES.GOOD_TO_KNOW
    ).map((publication) => publication.article),

    editorial:
      getZone(EDITORIAL_ZONES.EDITORIAL)[0]?.article ??
      null,

    discover: getZone(
      EDITORIAL_ZONES.DISCOVER
    ).map((publication) => publication.article),
  };
}