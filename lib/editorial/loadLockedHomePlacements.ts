import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { PUBLIC_ARTICLE_FILTER } from "@/lib/public-article";

import {
  HOME_VISIBLE_ZONE_CAPACITIES,
  type HomeVisibleZone,
} from "./homeComposition";

const HOME_VISIBLE_ZONES = Object.keys(
  HOME_VISIBLE_ZONE_CAPACITIES,
) as HomeVisibleZone[];

export type LockedHomePublication = {
  publicationId: number;
  priority: number;
  startsAt: Date | null;
  endsAt: Date | null;
  updatedAt: Date;
  zone: HomeVisibleZone;
  articleId: number;
  title: string;
  category: string;
  sourceId: number | null;
  sourceName: string;
};

export type LoadLockedHomePlacementsOptions = {
  evaluatedAt?: Date;
};

function isVisibleAt(
  startsAt: Date | null,
  endsAt: Date | null,
  evaluatedAt: Date,
): boolean {
  if (startsAt && startsAt > evaluatedAt) {
    return false;
  }

  if (endsAt && endsAt < evaluatedAt) {
    return false;
  }

  return true;
}

export async function loadLockedHomePlacements(
  options: LoadLockedHomePlacementsOptions = {},
  client: Pick<Prisma.TransactionClient, "publication"> = prisma,
): Promise<LockedHomePublication[]> {
  const evaluatedAt = options.evaluatedAt ?? new Date();

  const publications = await client.publication.findMany({
    where: {
      pageKey: "home",
      channel: "site",
      active: true,
      OR: [{ locked: true }, { origin: "MANUAL" }],
      zone: {
        in: HOME_VISIBLE_ZONES,
      },
      article: {
        ...PUBLIC_ARTICLE_FILTER,
        category: {
          not: "ILS_EN_PARLENT",
        },
      },
    },
    select: {
      id: true,
      zone: true,
      priority: true,
      startsAt: true,
      endsAt: true,
      updatedAt: true,
      article: {
        select: {
          id: true,
          title: true,
          category: true,
          author: true,
          observations: {
            orderBy: [
              {
                publishedAt: "desc",
              },
              {
                collectedAt: "desc",
              },
              {
                id: "desc",
              },
            ],
            take: 1,
            select: {
              source: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: [
      {
        priority: "desc",
      },
      {
        createdAt: "desc",
      },
      {
        id: "desc",
      },
    ],
  });

  const zoneCounts = new Map<HomeVisibleZone, number>();
  const usedArticleIds = new Set<number>();
  const placements: LockedHomePublication[] = [];

  for (const publication of publications) {
    if (!isVisibleAt(publication.startsAt, publication.endsAt, evaluatedAt)) {
      continue;
    }

    const zone = publication.zone as HomeVisibleZone;

    if (!HOME_VISIBLE_ZONES.includes(zone)) {
      continue;
    }

    if (usedArticleIds.has(publication.article.id)) {
      continue;
    }

    const currentZoneCount = zoneCounts.get(zone) ?? 0;

    if (currentZoneCount >= HOME_VISIBLE_ZONE_CAPACITIES[zone]) {
      continue;
    }

    const source = publication.article.observations[0]?.source;

    placements.push({
      publicationId: publication.id,
      priority: publication.priority,
      startsAt: publication.startsAt,
      endsAt: publication.endsAt,
      updatedAt: publication.updatedAt,
      zone,
      articleId: publication.article.id,
      title: publication.article.title,
      category: publication.article.category,
      sourceId: source?.id ?? null,
      sourceName: source?.name ?? publication.article.author,
    });

    usedArticleIds.add(publication.article.id);
    zoneCounts.set(zone, currentZoneCount + 1);
  }

  return placements;
}
