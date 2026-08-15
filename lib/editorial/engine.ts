import { prisma } from "@/lib/prisma";
import { PUBLIC_ARTICLE_FILTER } from "@/lib/public-article";
import type { Article } from "@/lib/generated/prisma/client";

import {
  EDITORIAL_ZONES,
  type EditorialZone,
} from "@/lib/editorial/zones";
import type { EditorialLayout } from "@/lib/editorial/types";

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

export async function buildEditorialLayout(
  pageKey: string
): Promise<EditorialLayout> {
  const publications = await prisma.publication.findMany({
    where: {
      pageKey,
      channel: "site",
      active: true,
      article: {
        ...PUBLIC_ARTICLE_FILTER,
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

  const usedArticleIds = new Set<number>();
  const takeUnique = (articles: Article[]) =>
    articles.filter((article) => {
      if (usedArticleIds.has(article.id)) {
        return false;
      }

      usedArticleIds.add(article.id);
      return true;
    });

  const takeFirstUnique = (zone: EditorialZone) =>
    takeUnique(
      getZone(zone)
        .map((publication) => publication.article)
        .slice(0, 1)
    )[0] ?? null;

  return {
    hero: takeFirstUnique(EDITORIAL_ZONES.HERO),

    feature: takeFirstUnique(EDITORIAL_ZONES.FEATURE),

    secondary: takeUnique(
      getZone(EDITORIAL_ZONES.SECONDARY).map(
        (publication) => publication.article
      )
    ),

    card: takeUnique(
      getZone(EDITORIAL_ZONES.CARD).map(
        (publication) => publication.article
      )
    ),

    briefs: takeUnique(
      getZone(EDITORIAL_ZONES.BRIEF).map(
        (publication) => publication.article
      )
    ),

    grandFormat: takeFirstUnique(EDITORIAL_ZONES.GRAND_FORMAT),

    question: takeFirstUnique(EDITORIAL_ZONES.QUESTION),

    goodToKnow: takeUnique(
      getZone(EDITORIAL_ZONES.GOOD_TO_KNOW).map(
        (publication) => publication.article
      )
    ),

    editorial: takeFirstUnique(EDITORIAL_ZONES.EDITORIAL),

    discover: takeUnique(
      getZone(EDITORIAL_ZONES.DISCOVER).map(
        (publication) => publication.article
      )
    ),
  };
}
