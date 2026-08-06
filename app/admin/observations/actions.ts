"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/admin/requireAdmin";
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
