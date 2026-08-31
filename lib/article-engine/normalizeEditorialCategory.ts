export const CANONICAL_EDITORIAL_CATEGORIES = [
  "ACTUALITÉ",
  "ÉCONOMIE",
  "SOCIÉTÉ",
  "CULTURE",
  "SPORTS",
  "MONTAGNE",
  "POLITIQUE",
  "ILS_EN_PARLENT",
  "LOISIRS",
  "INTERNATIONAL",
  "ÉDITORIAL",
] as const;

export type CanonicalEditorialCategory =
  (typeof CANONICAL_EDITORIAL_CATEGORIES)[number];

const CATEGORY_ALIASES: Record<
  string,
  CanonicalEditorialCategory
> = {
  ACTUALITE: "ACTUALITÉ",
  GENERAL: "ACTUALITÉ",
  GENERALE: "ACTUALITÉ",
  PRESSE: "ACTUALITÉ",

  ECONOMIE: "ÉCONOMIE",
  SOCIETE: "SOCIÉTÉ",

  CULTURE: "CULTURE",
  SPORTS: "SPORTS",
  MONTAGNE: "MONTAGNE",
  POLITIQUE: "POLITIQUE",
  ILS_EN_PARLENT: "ILS_EN_PARLENT",
  LOISIRS: "LOISIRS",
  LIFESTYLE: "LOISIRS",
  INTERNATIONAL: "INTERNATIONAL",
  EDITORIAL: "ÉDITORIAL",
};

function normalizeCategoryKey(value: string): string {
  return value
    .trim()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function normalizeEditorialCategory(
  value?: string | null,
): CanonicalEditorialCategory {
  if (!value) {
    return "ACTUALITÉ";
  }

  return (
    CATEGORY_ALIASES[normalizeCategoryKey(value)] ??
    "ACTUALITÉ"
  );
}
