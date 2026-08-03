import type { AdminIdentity } from "@/lib/admin/requireAdmin";
import { recordEditorialEvent } from "@/lib/editorial-history";
import { prisma } from "@/lib/prisma";

import {
  persistPreparedArticleTranslations,
  prepareArticleTranslations,
  type GenerateArticleTranslationsDependencies,
  type GenerateArticleTranslationsResult,
} from "./generateArticleTranslations";
import { PrismaArticleTranslationRepository } from "./repositories/PrismaArticleTranslationRepository";

export async function generateAuditedArticleTranslations(
  articleId: number,
  actor: AdminIdentity,
  dependencies: GenerateArticleTranslationsDependencies,
): Promise<GenerateArticleTranslationsResult> {
  const prepared = await prepareArticleTranslations(
    articleId,
    dependencies,
  );

  return prisma.$transaction(async (transaction) => {
    const translationRepository =
      new PrismaArticleTranslationRepository(transaction);

    return persistPreparedArticleTranslations(prepared, {
      translationRepository,
      onMutation: async (mutation) => {
        await recordEditorialEvent(transaction, {
          action: "TRANSLATION_GENERATED",
          articleId: mutation.articleId,
          translationId: mutation.translationId,
          actor,
          fromStatus: mutation.fromStatus,
          toStatus: mutation.toStatus,
          details: {
            locale: mutation.locale,
            operation: mutation.action,
          },
        });
      },
    });
  });
}
