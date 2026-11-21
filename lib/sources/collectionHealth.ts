import type { PrismaClient, Source } from "@/lib/generated/prisma/client";

/**
 * État de collecte d’une source, affiché dans l’administration pour que
 * les sources en erreur ou qui ne renvoient plus de date se voient.
 */

/** Fenêtre d’observation des dates : observations créées sur 14 jours. */
export const UNDATED_WINDOW_DAYS = 14;
/** En dessous de ce volume, la part sans date n’est pas significative. */
export const UNDATED_MIN_OBSERVATIONS = 3;
/** Part d’observations sans date à partir de laquelle la source est signalée. */
export const UNDATED_ALERT_RATIO = 0.5;

export type SourceCollectionIssueKind = "error" | "alert" | "undated";

export type SourceCollectionIssue = {
  kind: SourceCollectionIssueKind;
  label: string;
  detail: string | null;
};

export type RecentDateStats = {
  total: number;
  undated: number;
};

type SourceHealthFields = Pick<
  Source,
  | "active"
  | "availabilityStatus"
  | "lastErrorAt"
  | "lastSuccessAt"
  | "lastErrorMessage"
>;

function isInError(source: SourceHealthFields): boolean {
  if (source.availabilityStatus === "UNAVAILABLE") return true;
  if (!source.lastErrorAt) return false;

  return (
    !source.lastSuccessAt ||
    source.lastErrorAt.getTime() > source.lastSuccessAt.getTime()
  );
}

export function getSourceCollectionIssues(
  source: SourceHealthFields,
  recent: RecentDateStats | undefined,
): SourceCollectionIssue[] {
  // Une source désactivée n’est plus collectée : rien à surveiller.
  if (!source.active) return [];

  const issues: SourceCollectionIssue[] = [];

  if (isInError(source)) {
    issues.push({
      kind: "error",
      label: "En erreur",
      detail: source.lastErrorMessage,
    });
  } else if (source.lastErrorMessage?.startsWith("Alerte")) {
    // Alerte posée par une collecte réussie : vide ou sans date.
    issues.push({
      kind: "alert",
      label: "Alerte de collecte",
      detail: source.lastErrorMessage,
    });
  }

  if (
    recent &&
    recent.total >= UNDATED_MIN_OBSERVATIONS &&
    recent.undated / recent.total >= UNDATED_ALERT_RATIO
  ) {
    issues.push({
      kind: "undated",
      label: `Sans date : ${recent.undated}/${recent.total}`,
      detail: `${recent.undated} observation${recent.undated > 1 ? "s" : ""} sur ${recent.total} collectée${recent.total > 1 ? "s" : ""} en ${UNDATED_WINDOW_DAYS} jours n’${recent.undated > 1 ? "ont" : "a"} pas de date de publication.`,
    });
  }

  return issues;
}

/** Observations créées récemment et part sans date, par source. */
export async function loadRecentDateStats(
  client: Pick<PrismaClient, "observation">,
  now = new Date(),
): Promise<Map<number, RecentDateStats>> {
  const since = new Date(
    now.getTime() - UNDATED_WINDOW_DAYS * 24 * 60 * 60 * 1_000,
  );

  const [totals, undated] = await Promise.all([
    client.observation.groupBy({
      by: ["sourceId"],
      where: { collectedAt: { gte: since } },
      _count: { _all: true },
    }),
    client.observation.groupBy({
      by: ["sourceId"],
      where: { collectedAt: { gte: since }, publishedAt: null },
      _count: { _all: true },
    }),
  ]);

  const undatedBySource = new Map(
    undated.map((row) => [row.sourceId, row._count._all]),
  );

  return new Map(
    totals.map((row) => [
      row.sourceId,
      {
        total: row._count._all,
        undated: undatedBySource.get(row.sourceId) ?? 0,
      },
    ]),
  );
}
