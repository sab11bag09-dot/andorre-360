"use server";

import { revalidatePath } from "next/cache";

import { generateArticleTranslations } from "@/lib/article-engine/generateArticleTranslations";

export async function generateArticleTranslationsAction(
  articleId: number,
): Promise<void> {
  await generateArticleTranslations(
    articleId,
  );

  revalidatePath("/admin");
  revalidatePath("/admin/articles");
  revalidatePath(
    `/admin/articles/${articleId}`,
  );
}
