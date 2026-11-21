import type { ObservationInput } from "./collectors/Collector";
import { assessObservationPublishedAt } from "./observationDate";

/** Bilan des dates de publication d’une collecte. */
export type CollectionDateSummary = {
  /** Observations renvoyées par la source. */
  total: number;
  /** Observations dont la date est retenue. */
  dated: number;
  /** Observations sans date exploitable (absente, illisible ou refusée). */
  undated: number;
  /** Dont dates refusées parce que trop loin dans le futur. */
  futureRejected: number;
};

export function summarizeCollectionDates(
  observations: ObservationInput[],
  now = new Date(),
): CollectionDateSummary {
  const summary: CollectionDateSummary = {
    total: observations.length,
    dated: 0,
    undated: 0,
    futureRejected: 0,
  };

  for (const observation of observations) {
    const { publishedAt, issue } = assessObservationPublishedAt(
      observation.publishedAt,
      now,
    );

    if (publishedAt) {
      summary.dated += 1;
      continue;
    }

    summary.undated += 1;
    if (issue === "future") summary.futureRejected += 1;
  }

  return summary;
}

/**
 * Message d’alerte quand une collecte réussie ne renvoie aucune date :
 * la page de la source a probablement changé de mise en page.
 */
export function getUndatedCollectionAlert(
  sourceName: string,
  summary: CollectionDateSummary,
): string | null {
  if (summary.total === 0 || summary.dated > 0) {
    return null;
  }

  const observations =
    summary.total > 1
      ? `${summary.total} observations`
      : "1 observation";
  const future =
    summary.futureRejected > 0
      ? ` (${summary.futureRejected} date${summary.futureRejected > 1 ? "s" : ""} future${summary.futureRejected > 1 ? "s" : ""} refusée${summary.futureRejected > 1 ? "s" : ""})`
      : "";

  return `Alerte : ${sourceName} n’a renvoyé aucune date de publication sur ${observations}${future}.`;
}
