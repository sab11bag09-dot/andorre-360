export const EDITORIAL_ZONES = {
  // Zones éditoriales V2
  HERO: "hero",
  FEATURE: "feature",
  CARD: "card",
  BRIEF: "brief",
  GRAND_FORMAT: "grand-format",
  QUESTION: "question",
  GOOD_TO_KNOW: "good-to-know",
  EDITORIAL: "editorial",
  DISCOVER: "discover",

  // Zones conservées temporairement pour compatibilité
  MAIN: "main",
  SECONDARY: "secondary",
  COLUMN: "column",
  BOTTOM: "bottom",
  STANDARD: "standard",
} as const;

export type EditorialZone =
  (typeof EDITORIAL_ZONES)[keyof typeof EDITORIAL_ZONES];

export const EDITORIAL_ZONE_LABELS: Record<
  EditorialZone,
  string
> = {
  hero: "Une principale",
  feature: "Grande carte",
  card: "Carte éditoriale",
  brief: "L’essentiel",
  "grand-format": "Grand Format",
  question: "Question à…",
  "good-to-know": "Bon à savoir",
  editorial: "Édito",
  discover: "À découvrir",

  // Anciens noms, maintenus pendant la migration
  main: "Grande carte — ancien format",
  secondary: "Carte secondaire",
  column: "Colonne de droite — ancien format",
  bottom: "Bas de page — ancien format",
  standard: "Article standard",
};