import type { ContentLocale } from "@/lib/generated/prisma/client";

import { PrismaPublicArticleTranslationRepository } from "./repositories/PrismaPublicArticleTranslationRepository";
import type {
  PublicArticleTranslation,
  PublicArticleTranslationRepository,
} from "./repositories/PublicArticleTranslationRepository";

export type PublicTranslationLocale = "ca" | "es";

const localeMap: Record<PublicTranslationLocale, ContentLocale> = {
  ca: "CA",
  es: "ES",
};

export function isPublicTranslationLocale(
  locale: string,
): locale is PublicTranslationLocale {
  return locale === "ca" || locale === "es";
}

export async function getPublicArticleTranslation(
  locale: PublicTranslationLocale,
  slug: string,
  repository: PublicArticleTranslationRepository =
    new PrismaPublicArticleTranslationRepository(),
): Promise<PublicArticleTranslation | null> {
  return repository.findPublishedByLocaleAndSlug(
    localeMap[locale],
    slug,
  );
}
