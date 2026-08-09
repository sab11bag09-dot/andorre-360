"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/admin/requireAdmin";
import { prisma } from "@/lib/prisma";
import { createArticleFromObservation } from "@/lib/article-engine/createArticleFromObservation";

export async function createArticleFromObservationAction(
  observationId: number,
) {
  await requireAdmin();

  const { articleId } =
    await createArticleFromObservation(observationId);

  revalidatePath("/admin/observations");
  revalidatePath("/admin/articles");

  redirect(`/admin/articles/${articleId}`);
}

export async function regenerateArticleFromObservationAction(
  observationId: number,
) {
  await requireAdmin();

  const { articleId } = await createArticleFromObservation(
    observationId,
    undefined,
    { regenerate: true },
  );

  revalidatePath("/admin/observations");
  revalidatePath("/admin/articles");
  redirect(`/admin/articles/${articleId}`);
}

export async function deleteAiDraftFromObservationAction(
  observationId: number,
) {
  await requireAdmin();

  await prisma.$transaction(async (tx) => {
    const observation = await tx.observation.findUnique({
      where: { id: observationId },
      select: { articleId: true },
    });

    if (!observation?.articleId) {
      throw new Error("Aucun article associé à cette observation.");
    }

    const article = await tx.article.findUnique({
      where: { id: observation.articleId },
      select: { id: true, published: true, editorialStatus: true },
    });

    if (!article || article.published || article.editorialStatus !== "AI_DRAFT") {
      throw new Error("Seuls les brouillons IA peuvent être supprimés.");
    }

    await tx.article.delete({ where: { id: article.id } });

    await tx.observation.update({
      where: { id: observationId },
      data: {
        articleId: null,
        processed: false,
        processedAt: null,
      },
    });
  });

  revalidatePath("/admin/observations");
  revalidatePath("/admin/articles");
  redirect("/admin/observations");
}

export async function deleteAllDraftArticlesAction() {
  await requireAdmin();

  await prisma.$transaction(async (tx) => {
    const drafts = await tx.article.findMany({
      where: {
        published: false,
        editorialStatus: { in: ["DRAFT", "AI_DRAFT"] },
      },
      select: { id: true },
    });

    const draftIds = drafts.map(({ id }) => id);

    if (draftIds.length > 0) {
      await tx.observation.updateMany({
        where: { articleId: { in: draftIds } },
        data: {
          articleId: null,
          processed: false,
          processedAt: null,
        },
      });

      await tx.article.deleteMany({
        where: { id: { in: draftIds } },
      });
    }
  });

  revalidatePath("/admin/observations");
  revalidatePath("/admin/articles");
  redirect("/admin/observations");
}
