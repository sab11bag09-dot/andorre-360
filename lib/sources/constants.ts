export const ORGANIZATION_TYPES = [
  { value: "GOVERNMENT", label: "Gouvernement" },
  { value: "CITY", label: "Commune / mairie" },
  { value: "POLICE", label: "Police" },
  { value: "EMERGENCY", label: "Secours" },
  { value: "TOURISM", label: "Office de tourisme" },
  { value: "SKI_RESORT", label: "Station de ski" },
  { value: "TRANSPORT", label: "Routes et transports" },
  { value: "SPORT", label: "Sport" },
  { value: "CULTURE", label: "Culture" },
  { value: "WEATHER", label: "Météo" },
  { value: "OTHER", label: "Autre" },
] as const;

export const COLLECTION_MODES = [
  { value: "RSS", label: "Flux RSS" },
  { value: "API", label: "API" },
  { value: "WEBSITE", label: "Site internet" },
] as const;

export const PUBLICATION_MODES = [
  { value: "AUTO", label: "Automatique" },
  { value: "ASSISTED", label: "Assistée" },
  { value: "MANUAL", label: "Manuelle" },
] as const;

export const TRUST_LEVELS = [
  { value: "VERY_HIGH", label: "Très élevée" },
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