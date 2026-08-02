export type PublicFilInfoLocale = "fr" | "ca" | "es";

export function isTranslatedFilInfoLocale(
  value: string,
): value is Exclude<PublicFilInfoLocale, "fr"> {
  return value === "ca" || value === "es";
}

export function getFilInfoPath(locale: PublicFilInfoLocale) {
  return locale === "fr" ? "/fil-info" : `/${locale}/fil-info`;
}

export function getFilInfoArticlePath(
  locale: PublicFilInfoLocale,
  slug: string,
) {
  return locale === "fr" ? `/article/${slug}` : `/${locale}/article/${slug}`;
}
