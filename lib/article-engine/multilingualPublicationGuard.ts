import type {
  ContentLocale,
  EditorialStatus,
} from "@/lib/generated/prisma/client";

export const REQUIRED_TRANSLATION_LOCALES = [
  "CA",
  "ES",
] as const satisfies readonly ContentLocale[];

type TranslationPublicationState = {
  locale: ContentLocale;
  status: EditorialStatus;
};

export function getMissingPublishedTranslationLocales(
  translations: readonly TranslationPublicationState[],
): ContentLocale[] {
  const publishedLocales = new Set(
    translations
      .filter(({ status }) => status === "PUBLISHED")
      .map(({ locale }) => locale),
  );

  return REQUIRED_TRANSLATION_LOCALES.filter(
    (locale) => !publishedLocales.has(locale),
  );
}

export function assertRequiredTranslationsPublished(
  translations: readonly TranslationPublicationState[],
): void {
  const missingLocales =
    getMissingPublishedTranslationLocales(translations);

  if (missingLocales.length > 0) {
    throw new Error(
      `Les traductions suivantes doivent être publiées avant l’article : ${missingLocales.join(", ")}.`,
    );
  }
}
