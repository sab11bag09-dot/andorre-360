export const ORGANIZATION_TYPES = [
  { value: "GOVERNMENT", label: "Gouvernement" },
  { value: "COMMUNE", label: "Commune" },
  { value: "POLICE", label: "Police" },
  { value: "EMERGENCY_SERVICE", label: "Service de secours" },
  { value: "SPORTS_CLUB", label: "Club sportif" },
  { value: "SPORTS_FEDERATION", label: "Fédération sportive" },
  { value: "COMPANY", label: "Entreprise" },
  { value: "ASSOCIATION", label: "Association" },
  { value: "MEDIA", label: "Média" },
  { value: "WEATHER_SERVICE", label: "Service météo" },
  { value: "OTHER", label: "Autre" },
] as const;

export const COLLECTION_MODES = [
  { value: "RSS", label: "Flux RSS" },
  { value: "HTML", label: "Site internet" },
  { value: "API", label: "API" },
  { value: "PDF", label: "Document PDF" },
  { value: "FACEBOOK", label: "Facebook" },
  { value: "X", label: "X (Twitter)" },
  { value: "YOUTUBE", label: "YouTube" },
  { value: "EMAIL", label: "E-mail" },
] as const;

export const PUBLICATION_MODES = [
  { value: "AUTO", label: "Automatique" },
  { value: "ASSISTED", label: "Assistée" },
  { value: "MANUAL", label: "Manuelle" },
] as const;

export const TRUST_LEVELS = [
  { value: "OFFICIAL", label: "Officielle" },
  { value: "HIGH", label: "Élevée" },
  { value: "MEDIUM", label: "Moyenne" },
  { value: "LOW", label: "Faible" },
] as const;

export const CHECK_INTERVALS = [
  { value: 5, label: "Toutes les 5 minutes" },
  { value: 15, label: "Toutes les 15 minutes" },
  { value: 30, label: "Toutes les 30 minutes" },
  { value: 60, label: "Toutes les heures" },
] as const;

export function getOptionLabel(
  options: readonly { value: string; label: string }[],
  value: string,
) {
  return options.find((option) => option.value === value)?.label ?? value;
}
