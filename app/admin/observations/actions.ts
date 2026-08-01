"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createArticleFromObservation } from "@/lib/article-engine/createArticleFromObservation";

export async function createArticleFromObservationAction(
  observationId: number,
) {
  const { articleId } =
    await createArticleFromObservation(observationId);

  revalidatePath("/admin/observations");
  revalidatePath("/admin/articles");

  redirect(`/admin/articles/${articleId}`);
}