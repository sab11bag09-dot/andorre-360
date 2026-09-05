import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import {
  HOME_VISIBLE_ZONE_CAPACITIES,
  type HomeVisibleZone,
} from "./homeComposition";

const HOME_VISIBLE_ZONES = Object.keys(
  HOME_VISIBLE_ZONE_CAPACITIES,
) as HomeVisibleZone[];

export type MutableHomePublicationSnapshot = {
  publicationId: number;
  articleId: number;
  channel: string;
  pageKey: string;
  zone: HomeVisibleZone;
  priority: number;
  startsAt: Date | null;
  endsAt: Date | null;
  active: boolean;
  origin: "AUTOMATED" | "FALLBACK";
  locked: false;
  automationScore: number | null;
  automationPolicyVersion: string | null;
  automationRunId: string | null;
  updatedAt: Date;
};

export async function loadMutableHomePublications(
  client: Pick<Prisma.TransactionClient, "publication"> = prisma,
): Promise<MutableHomePublicationSnapshot[]> {
  const publications = await client.publication.findMany({
    where: {
      pageKey: "home",
      channel: "site",
      active: true,
      locked: false,
      origin: {
        in: ["AUTOMATED", "FALLBACK"],
      },
      zone: {
        in: HOME_VISIBLE_ZONES,
      },
    },
    select: {
      id: true,
      articleId: true,
      channel: true,
      pageKey: true,
      zone: true,
      priority: true,
      startsAt: true,
      endsAt: true,
      active: true,
      origin: true,
      locked: true,
      automationScore: true,
      automationPolicyVersion: true,
      automationRunId: true,
      updatedAt: true,
    },
    orderBy: {
      id: "asc",
    },
  });

  return publications.map((publication) => ({
    publicationId: publication.id,
    articleId: publication.articleId,
    channel: publication.channel,
    pageKey: publication.pageKey,
    zone: publication.zone as HomeVisibleZone,
    priority: publication.priority,
    startsAt: publication.startsAt,
    endsAt: publication.endsAt,
    active: publication.active,
    origin: publication.origin as "AUTOMATED" | "FALLBACK",
    locked: false,
    automationScore: publication.automationScore,
    automationPolicyVersion: publication.automationPolicyVersion,
    automationRunId: publication.automationRunId,
    updatedAt: publication.updatedAt,
  }));
}
