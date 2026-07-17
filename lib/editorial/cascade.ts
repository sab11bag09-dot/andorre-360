import {
  EDITORIAL_ZONES,
  type EditorialZone,
} from "@/lib/editorial/zones";

/*
 * Ordre officiel de la cascade éditoriale.
 *
 * Lorsqu’un contenu est remplacé :
 *
 * Une principale
 * ↓
 * Grande carte
 * ↓
 * Carte éditoriale
 * ↓
 * Brève
 * ↓
 * Grand Format
 * ↓
 * Archives
 *
 * Les zones "editorial" et "discover" restent hors cascade.
 */

export const EDITORIAL_CASCADE: EditorialZone[] = [
  EDITORIAL_ZONES.HERO,
  EDITORIAL_ZONES.FEATURE,
  EDITORIAL_ZONES.CARD,
  EDITORIAL_ZONES.BRIEF,
  EDITORIAL_ZONES.GRAND_FORMAT,
];

export function getCascadeDestination(
  zone: EditorialZone
): EditorialZone | null {
  const currentIndex = EDITORIAL_CASCADE.indexOf(zone);

  if (
    currentIndex === -1 ||
    currentIndex === EDITORIAL_CASCADE.length - 1
  ) {
    return null;
  }

  return EDITORIAL_CASCADE[currentIndex + 1];
}

export function getCascadeZonesFrom(
  zone: EditorialZone
): EditorialZone[] {
  const currentIndex = EDITORIAL_CASCADE.indexOf(zone);

  if (currentIndex === -1) {
    return [];
  }

  return EDITORIAL_CASCADE.slice(currentIndex);
}