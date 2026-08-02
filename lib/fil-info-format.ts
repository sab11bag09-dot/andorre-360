export const FIL_INFO_FORMATS = [
  {
    value: "ARTICLE",
    label: "Article",
    description: "Contenu complet avec une page publique.",
  },
  {
    value: "BRIEF",
    label: "Brève",
    description: "Information concise présentée avec son résumé.",
  },
  {
    value: "ALERT",
    label: "Alerte",
    description: "Information prioritaire mise en évidence dans le fil.",
  },
] as const;

export type FilInfoFormat =
  (typeof FIL_INFO_FORMATS)[number]["value"];

export function normalizeFilInfoFormat(value: unknown): FilInfoFormat {
  if (typeof value !== "string") {
    return "ARTICLE";
  }

  const normalizedValue = value
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();

  if (normalizedValue === "ALERT" || normalizedValue === "ALERTE") {
    return "ALERT";
  }

  if (
    normalizedValue === "BRIEF" ||
    normalizedValue === "BREVE"
  ) {
    return "BRIEF";
  }

  return "ARTICLE";
}

export function getFilInfoFormatLabel(
  value: unknown,
  locale: "fr" | "ca" | "es" = "fr",
): string {
  const normalizedValue = normalizeFilInfoFormat(value);

  if (locale === "ca") {
    return { ARTICLE: "Article", BRIEF: "Breu", ALERT: "Alerta" }[normalizedValue];
  }

  if (locale === "es") {
    return { ARTICLE: "Artículo", BRIEF: "Breve", ALERT: "Alerta" }[normalizedValue];
  }

  return (
    FIL_INFO_FORMATS.find(
      (format) => format.value === normalizedValue,
    )?.label ?? "Article"
  );
}
