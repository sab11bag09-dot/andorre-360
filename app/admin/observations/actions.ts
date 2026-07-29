"use server";

import { revalidatePath } from "next/cache";

import { createArticleFromObservation } from "@/lib/article-engine/createArticleFromObservation";

export async function createArticleFromObservationAction(
  observationId: number,
) {
  await createArticleFromObservation(observationId);

  revalidatePath("/admin/observations");
  revalidatePath("/admin/articles");
}