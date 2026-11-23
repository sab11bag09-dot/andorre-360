/**
 * Nom public d’une rubrique dans la langue de l’article. La base garde la
 * rubrique en français (« POLITIQUE », « ILS_EN_PARLENT ») ; les pages en
 * catalan et en espagnol l’affichent traduite. Une rubrique inconnue est
 * affichée telle quelle, sans tiret bas.
 */

export type CategoryLanguage = "fr" | "ca" | "es";

const LABELS: Record<string, Record<CategoryLanguage, string>> = {
  ACTUALITE: { fr: "ACTUALITÉ", ca: "ACTUALITAT", es: "ACTUALIDAD" },
  ECONOMIE: { fr: "ÉCONOMIE", ca: "ECONOMIA", es: "ECONOMÍA" },
  SOCIETE: { fr: "SOCIÉTÉ", ca: "SOCIETAT", es: "SOCIEDAD" },
  CULTURE: { fr: "CULTURE", ca: "CULTURA", es: "CULTURA" },
  SPORTS: { fr: "SPORTS", ca: "ESPORTS", es: "DEPORTES" },
  MONTAGNE: { fr: "MONTAGNE", ca: "MUNTANYA", es: "MONTAÑA" },
  POLITIQUE: { fr: "POLITIQUE", ca: "POLÍTICA", es: "POLÍTICA" },
  ILS_EN_PARLENT: { fr: "ILS EN PARLENT", ca: "EN PARLEN", es: "HABLAN DE ELLO" },
  LOISIRS: { fr: "LOISIRS", ca: "LLEURE", es: "OCIO" },
  LIFESTYLE: { fr: "LOISIRS", ca: "LLEURE", es: "OCIO" },
  INTERNATIONAL: { fr: "INTERNATIONAL", ca: "INTERNACIONAL", es: "INTERNACIONAL" },
  EDITORIAL: { fr: "ÉDITORIAL", ca: "EDITORIAL", es: "EDITORIAL" },
  IMMOBILIER: { fr: "IMMOBILIER", ca: "IMMOBILIARI", es: "INMOBILIARIO" },
};

function key(value: string): string {
  return value
    .trim()
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/gu, "_")
    .replace(/^_+|_+$/gu, "");
}

export function categoryLabel(category: string, language: CategoryLanguage): string {
  return LABELS[key(category)]?.[language] ?? category.replace(/_/gu, " ");
}
