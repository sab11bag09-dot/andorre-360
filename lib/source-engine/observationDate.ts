/**
 * Tolérance pour une date de publication légèrement en avance :
 * décalage horaire du site, horloge du serveur source.
 */
const MAX_FUTURE_DATE_OFFSET_MS =
  24 * 60 * 60 * 1_000;

export type ObservationDateIssue =
  /** Aucune date n’a été trouvée. */
  | "missing"
  /** La valeur lue n’est pas une date. */
  | "invalid"
  /** La date lue est plus d’un jour dans le futur : elle est refusée. */
  | "future";

export type ObservationDateAssessment = {
  publishedAt: Date | null;
  issue: ObservationDateIssue | null;
};

/** Qualifie la date de publication lue pour une observation. */
export function assessObservationPublishedAt(
  date: Date | null,
  now = new Date(),
): ObservationDateAssessment {
  if (!date) {
    return { publishedAt: null, issue: "missing" };
  }

  if (Number.isNaN(date.getTime())) {
    return { publishedAt: null, issue: "invalid" };
  }

  if (date.getTime() > now.getTime() + MAX_FUTURE_DATE_OFFSET_MS) {
    return { publishedAt: null, issue: "future" };
  }

  return { publishedAt: date, issue: null };
}

/** Date de publication retenue, ou `null` si elle manque ou est refusée. */
export function normalizeObservationPublishedAt(
  date: Date | null,
  now = new Date(),
): Date | null {
  return assessObservationPublishedAt(date, now).publishedAt;
}
