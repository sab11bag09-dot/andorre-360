"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import {
  getCascadeDestination,
} from "@/lib/editorial/cascade";
import type { EditorialZone } from "@/lib/editorial/zones";

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

function revalidateEditorialPages(pageKey: string) {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/editorial");
  revalidatePath("/admin/diffusion");

  if (pageKey === "category:ACTUALITÉ") {
    revalidatePath("/actualite");
  }

  if (pageKey === "category:ÉCONOMIE") {
    revalidatePath("/economie");
  }

  if (pageKey === "category:SOCIÉTÉ") {
    revalidatePath("/societe");
  }

  if (pageKey === "category:CULTURE") {
    revalidatePath("/culture");
  }

  if (pageKey === "category:MONTAGNE") {
    revalidatePath("/montagne");
  }
}

async function movePublicationDown(
  transaction: Parameters<
    Parameters<typeof prisma.$transaction>[0]
  >[0],
  publicationId: number,
  pageKey: string,
  channel: string,
  currentZone: EditorialZone
): Promise<number> {
  const destinationZone =
    getCascadeDestination(currentZone);

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

  const destinationPublication =
    await transaction.publication.findFirst({
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
      destinationZone
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
    },
  });

  return movedArticles + 1;
}

export async function replacePublication(
  input: ReplacePublicationInput
): Promise<ReplacePublicationResult> {
  const {
    articleId,
    pageKey,
    zone,
    channel = "site",
    priority = 20,
  } = input;

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
    },
  });

  if (!article) {
    return {
      success: false,
      message: "Article introuvable.",
    };
  }

  if (!article.published) {
    return {
      success: false,
      message: "Cet article n’est pas publié.",
    };
  }

  const result = await prisma.$transaction(
    async (transaction) => {
      const currentPublication =
        await transaction.publication.findFirst({
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

      if (
        currentPublication &&
        currentPublication.articleId === articleId
      ) {
        return {
          publication: currentPublication,
          previousArticleId: undefined,
          movedArticles: 0,
          unchanged: true,
        };
      }

      let movedArticles = 0;

      if (currentPublication) {
        movedArticles += await movePublicationDown(
          transaction,
          currentPublication.id,
          pageKey,
          channel,
          zone
        );
      }

      const existingTargetPublication =
        await transaction.publication.findFirst({
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
            },
          });

      return {
        publication,
        previousArticleId:
          currentPublication?.articleId,
        movedArticles,
        unchanged: false,
      };
    }
  );

  revalidateEditorialPages(pageKey);

  if (result.unchanged) {
    return {
      success: true,
      message:
        "Cet article occupe déjà cet emplacement.",
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