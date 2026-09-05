import type { Prisma } from "@/lib/generated/prisma/client";
import { PUBLIC_ARTICLE_FILTER } from "@/lib/public-article";

import {
  HOME_VISIBLE_ZONE_CAPACITIES,
  type HomeCompositionPlacement,
  type HomeVisibleZone,
} from "./homeComposition";
import type { LockedHomePublication } from "./loadLockedHomePlacements";
import type { MutableHomePublicationSnapshot } from "./loadMutableHomePublications";

export type WriteAutomatedHomeCompositionInput = {
  runId: string;
  policyVersion: string;
  appliedAt: Date;
  placements: readonly HomeCompositionPlacement[];
  lockedPlacements: readonly LockedHomePublication[];
  mutablePublications: readonly MutableHomePublicationSnapshot[];
};

export type WriteAutomatedHomeCompositionResult = {
  createdPublicationIds: number[];
  disabledPublicationIds: number[];
  preservedLockedPublicationIds: number[];
  placements: Array<{
    publicationId: number;
    articleId: number;
    zone: HomeVisibleZone;
    score: number;
    origin: "AUTOMATED" | "FALLBACK";
  }>;
};

type HomeCompositionWriter = Pick<
  Prisma.TransactionClient,
  "article" | "publication"
>;

function assertValidComposition(
  placements: readonly HomeCompositionPlacement[],
  lockedPlacements: readonly LockedHomePublication[],
): void {
  const articleIds = new Set<number>();
  const zoneCounts = new Map<HomeVisibleZone, number>();

  for (const placement of placements) {
    if (articleIds.has(placement.articleId)) {
      throw new Error(
        `L’article ${placement.articleId} apparaît plusieurs fois dans la composition.`,
      );
    }

    articleIds.add(placement.articleId);

    const zoneCount = (zoneCounts.get(placement.zone) ?? 0) + 1;
    const capacity = HOME_VISIBLE_ZONE_CAPACITIES[placement.zone];

    if (zoneCount > capacity) {
      throw new Error(
        `La zone ${placement.zone} dépasse sa capacité de ${capacity}.`,
      );
    }

    zoneCounts.set(placement.zone, zoneCount);
  }

  const expectedLocked = placements
    .filter(({ origin }) => origin === "LOCKED")
    .map(({ articleId, zone }) => `${zone}:${articleId}`)
    .sort();

  const currentLocked = lockedPlacements
    .map(({ articleId, zone }) => `${zone}:${articleId}`)
    .sort();

  if (
    expectedLocked.length !== currentLocked.length ||
    expectedLocked.some(
      (signature, index) => signature !== currentLocked[index],
    )
  ) {
    throw new Error(
      "La composition ne correspond pas aux sélections humaines protégées.",
    );
  }
}

function getAutomaticPriority(
  zone: HomeVisibleZone,
  index: number,
  lockedPlacements: readonly LockedHomePublication[],
): number {
  const lockedPriorities = lockedPlacements
    .filter((placement) => placement.zone === zone)
    .map(({ priority }) => priority);

  const firstPriority =
    lockedPriorities.length > 0 ? Math.min(...lockedPriorities) - 1 : 10;

  return firstPriority - index;
}

export async function writeAutomatedHomeComposition(
  transaction: HomeCompositionWriter,
  input: WriteAutomatedHomeCompositionInput,
): Promise<WriteAutomatedHomeCompositionResult> {
  assertValidComposition(input.placements, input.lockedPlacements);

  const writablePlacements = input.placements.filter(
    (
      placement,
    ): placement is HomeCompositionPlacement & {
      origin: "AUTOMATED" | "FALLBACK";
    } => placement.origin !== "LOCKED",
  );

  const writableArticleIds = writablePlacements.map(
    ({ articleId }) => articleId,
  );

  if (writableArticleIds.length > 0) {
    const publicArticles = await transaction.article.findMany({
      where: {
        id: {
          in: writableArticleIds,
        },
        ...PUBLIC_ARTICLE_FILTER,
        category: {
          not: "ILS_EN_PARLENT",
        },
      },
      select: {
        id: true,
      },
    });

    const publicArticleIds = new Set(publicArticles.map(({ id }) => id));

    const invalidArticleId = writableArticleIds.find(
      (articleId) => !publicArticleIds.has(articleId),
    );

    if (invalidArticleId !== undefined) {
      throw new Error(
        `L’article ${invalidArticleId} n’est plus admissible à la publication.`,
      );
    }
  }

  const mutablePublicationIds = input.mutablePublications.map(
    ({ publicationId }) => publicationId,
  );

  if (mutablePublicationIds.length > 0) {
    const deactivation = await transaction.publication.updateMany({
      where: {
        id: {
          in: mutablePublicationIds,
        },
        pageKey: "home",
        channel: "site",
        active: true,
        locked: false,
        origin: {
          in: ["AUTOMATED", "FALLBACK"],
        },
      },
      data: {
        active: false,
        endsAt: input.appliedAt,
      },
    });

    if (deactivation.count !== mutablePublicationIds.length) {
      throw new Error(
        "Les publications automatiques ont changé pendant l’application.",
      );
    }
  }

  const createdPublicationIds: number[] = [];
  const createdPlacements: WriteAutomatedHomeCompositionResult["placements"] =
    [];
  const zoneIndexes = new Map<HomeVisibleZone, number>();

  for (const placement of writablePlacements) {
    const zoneIndex = zoneIndexes.get(placement.zone) ?? 0;

    const publication = await transaction.publication.create({
      data: {
        articleId: placement.articleId,
        pageKey: "home",
        channel: "site",
        zone: placement.zone,
        priority: getAutomaticPriority(
          placement.zone,
          zoneIndex,
          input.lockedPlacements,
        ),
        startsAt: input.appliedAt,
        endsAt: null,
        active: true,
        origin: placement.origin,
        locked: false,
        automationScore: placement.score,
        automationPolicyVersion: input.policyVersion,
        automationRunId: input.runId,
      },
      select: {
        id: true,
      },
    });

    zoneIndexes.set(placement.zone, zoneIndex + 1);
    createdPublicationIds.push(publication.id);

    createdPlacements.push({
      publicationId: publication.id,
      articleId: placement.articleId,
      zone: placement.zone,
      score: placement.score,
      origin: placement.origin,
    });
  }

  return {
    createdPublicationIds,
    disabledPublicationIds: mutablePublicationIds,
    preservedLockedPublicationIds: input.lockedPlacements.map(
      ({ publicationId }) => publicationId,
    ),
    placements: createdPlacements,
  };
}
