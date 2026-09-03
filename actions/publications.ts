"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin/requireAdmin";
import { getCascadeDestination } from "@/lib/editorial/cascade";
import type { EditorialZone } from "@/lib/editorial/zones";
import { recordEditorialEvent } from "@/lib/editorial-history";
import { prisma } from "@/lib/prisma";
import { isPublicArticle } from "@/lib/public-article";
import { revalidateEditorialPublicPage } from "@/lib/public-revalidation";

export type ReplacePublicationInput = {
  articleId: number;
  pageKey: string;
  zone: EditorialZone;
  channel?: string;
  priority?: number;
};

export type ReplacePublicationResult = {
  success: boolean;
  message: string;
  publicationId?: number;
  previousArticleId?: number;
  movedArticles?: number;
};

const MANUAL_PUBLICATION_METADATA = {
  origin: "MANUAL" as const,
  locked: true,
  automationScore: null,
  automationPolicyVersion: null,
  automationRunId: null,
};

function revalidateEditorialPages(pageKey: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/editorial");
  revalidatePath("/admin/diffusion");
  revalidateEditorialPublicPage(pageKey);
}

async function movePublicationDown(
  transaction: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  publicationId: number,
  pageKey: string,
  channel: string,
  currentZone: EditorialZone,
): Promise<number> {
  const destinationZone = getCascadeDestination(currentZone);

  if (!destinationZone) {
    await transaction.publication.update({
      where: {
        id: publicationId,
      },
      data: {
        active: false,
        endsAt: new Date(),
      },
    });

    return 1;
  }

  const destinationPublication = await transaction.publication.findFirst({
    where: {
      pageKey,
      channel,
      zone: destinationZone,
      active: true,
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

  let movedArticles = 0;

  if (destinationPublication) {
    movedArticles += await movePublicationDown(
      transaction,
      destinationPublication.id,
      pageKey,
      channel,
      destinationZone,
    );
  }

  await transaction.publication.update({
    where: {
      id: publicationId,
    },
    data: {
      zone: destinationZone,
      priority: 10,
      startsAt: new Date(),
      endsAt: null,
      active: true,
      ...MANUAL_PUBLICATION_METADATA,
    },
  });

  return movedArticles + 1;
}

export async function replacePublication(
  input: ReplacePublicationInput,
): Promise<ReplacePublicationResult> {
  const admin = await requireAdmin();

  const { articleId, pageKey, zone, channel = "site", priority = 20 } = input;

  if (!Number.isInteger(articleId) || articleId <= 0) {
    return {
      success: false,
      message: "Identifiant d’article invalide.",
    };
  }

  const article = await prisma.article.findUnique({
    where: {
      id: articleId,
    },
    select: {
      id: true,
      published: true,
      editorialStatus: true,
    },
  });

  if (!article) {
    return {
      success: false,
      message: "Article introuvable.",
    };
  }

  if (!isPublicArticle(article)) {
    return {
      success: false,
      message: "Cet article n’est pas publié et validé.",
    };
  }

  const result = await prisma.$transaction(async (transaction) => {
    const currentPublication = await transaction.publication.findFirst({
      where: {
        pageKey,
        channel,
        zone,
        active: true,
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

    if (currentPublication && currentPublication.articleId === articleId) {
      const alreadyManualAndLocked =
        currentPublication.origin === "MANUAL" &&
        currentPublication.locked &&
        currentPublication.automationScore === null &&
        currentPublication.automationPolicyVersion === null &&
        currentPublication.automationRunId === null;

      if (alreadyManualAndLocked) {
        return {
          publication: currentPublication,
          previousArticleId: undefined,
          movedArticles: 0,
          unchanged: true,
        };
      }

      const publication = await transaction.publication.update({
        where: {
          id: currentPublication.id,
        },
        data: MANUAL_PUBLICATION_METADATA,
      });

      await recordEditorialEvent(transaction, {
        action: "PUBLICATION_PLACED",
        articleId,
        actor: admin,
        details: {
          pageKey,
          zone,
          channel,
          priority,
          previousArticleId: null,
          movedArticles: 0,
          manualLockApplied: true,
        },
      });

      return {
        publication,
        previousArticleId: undefined,
        movedArticles: 0,
        unchanged: false,
        manualLockApplied: true,
      };
    }

    let movedArticles = 0;

    if (currentPublication) {
      movedArticles += await movePublicationDown(
        transaction,
        currentPublication.id,
        pageKey,
        channel,
        zone,
      );
    }

    const existingTargetPublication = await transaction.publication.findFirst({
      where: {
        articleId,
        pageKey,
        channel,
        zone,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const publication = existingTargetPublication
      ? await transaction.publication.update({
          where: {
            id: existingTargetPublication.id,
          },
          data: {
            active: true,
            priority,
            startsAt: new Date(),
            endsAt: null,
            zone,
            ...MANUAL_PUBLICATION_METADATA,
          },
        })
      : await transaction.publication.create({
          data: {
            articleId,
            pageKey,
            channel,
            zone,
            priority,
            startsAt: new Date(),
            endsAt: null,
            active: true,
            ...MANUAL_PUBLICATION_METADATA,
          },
        });

    await recordEditorialEvent(transaction, {
      action: "PUBLICATION_PLACED",
      articleId,
      actor: admin,
      details: {
        pageKey,
        zone,
        channel,
        priority,
        previousArticleId: currentPublication?.articleId ?? null,
        movedArticles,
      },
    });

    return {
      publication,
      previousArticleId: currentPublication?.articleId,
      movedArticles,
      unchanged: false,
    };
  });

  revalidateEditorialPages(pageKey);

  if ("manualLockApplied" in result && result.manualLockApplied) {
    return {
      success: true,
      message: "Sélection humaine verrouillée.",
      publicationId: result.publication.id,
      movedArticles: 0,
    };
  }

  if (result.unchanged) {
    return {
      success: true,
      message: "Cet article occupe déjà cet emplacement.",
      publicationId: result.publication.id,
      movedArticles: 0,
    };
  }

  return {
    success: true,
    message: "Remplacement et cascade effectués.",
    publicationId: result.publication.id,
    previousArticleId: result.previousArticleId,
    movedArticles: result.movedArticles,
  };
}
