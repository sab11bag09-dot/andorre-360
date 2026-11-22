import Link from "next/link";

import EditorialStatusBadge from "@/components/admin/article/EditorialStatusBadge";
import { Badge, EmptyState, PageHeader, StatCard } from "@/components/admin/ui";
import type { DraftQualityVerdict } from "@/lib/article-engine/draftQuality";
import { DRAFT_QUALITY_PUBLISHABLE_SCORE } from "@/lib/article-engine/draftQuality";
import {
  loadDraftQualityReport,
  summarizeDraftQuality,
} from "@/lib/article-engine/draftQualityReport";

export const dynamic = "force-dynamic";

const VERDICT_BADGE: Record<DraftQualityVerdict, "success" | "warning" | "danger"> = {
  publiable: "success",
  "à revoir": "warning",
  refusé: "danger",
};

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Andorra",
});

/**
 * Qualité des articles rédigés par l’IA (étape 1 de la feuille de route) :
 * note sur 100 et verdict de chaque article, calculés sans appel à l’IA.
 */
export default async function DraftQualityPage() {
  const entries = await loadDraftQualityReport();
  const summary = summarizeDraftQuality(entries);

  return (
    <>
      <PageHeader
        backHref="/admin"
        backLabel="Retour au tableau de bord"
        title="Qualité des articles de l’IA"
        description={`Chaque article rédigé par l’IA est noté sur 100 à partir du texte de sa source, sans appel à l’IA. Publiable : ${DRAFT_QUALITY_PUBLISHABLE_SCORE} points et aucun défaut bloquant.`}
      />

      <section className="grid gap-4 border-b border-zinc-800 py-8 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Note moyenne" value={summary.averageScore ?? "—"} description={`${summary.total} article${summary.total > 1 ? "s" : ""} noté${summary.total > 1 ? "s" : ""}`} />
        <StatCard title="Publiables" value={summary.verdicts.publiable} valueClassName="text-emerald-400" />
        <StatCard title="À revoir" value={summary.verdicts["à revoir"]} valueClassName="text-amber-400" />
        <StatCard title="Refusés" value={summary.verdicts.refusé} valueClassName="text-red-400" />
      </section>

      <section className="py-8" aria-labelledby="quality-list-title">
        <h2 id="quality-list-title" className="mb-5 font-serif text-2xl">
          Articles notés
        </h2>

        {entries.length === 0 ? (
          <EmptyState
            title="Aucun article rédigé par l’IA"
            description="Les articles produits par l’orchestrateur apparaîtront ici avec leur note."
          />
        ) : (
          <ul className="divide-y divide-zinc-800 rounded-2xl border border-zinc-800 bg-zinc-950">
            {entries.map((entry) => (
              <li key={entry.articleId} className="grid gap-4 p-5 lg:grid-cols-[96px_minmax(0,1fr)]">
                <div>
                  <p className="font-serif text-4xl leading-none">{entry.quality.score}</p>
                  <Badge variant={VERDICT_BADGE[entry.quality.verdict]} className="mt-2">
                    {entry.quality.verdict}
                  </Badge>
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                    <span>#{entry.articleId}</span>
                    <span>·</span>
                    <span>{entry.category}</span>
                    <span>·</span>
                    <span>{entry.sourceName}</span>
                    {entry.generatedAt && (
                      <>
                        <span>·</span>
                        <span>{dateFormat.format(entry.generatedAt)}</span>
                      </>
                    )}
                    <EditorialStatusBadge status={entry.editorialStatus} />
                  </div>

                  <Link
                    href={`/admin/articles/${entry.articleId}`}
                    className="mt-2 block font-serif text-lg leading-snug hover:text-yellow-500"
                  >
                    {entry.title}
                  </Link>

                  {entry.quality.blockers.length > 0 && (
                    <p className="mt-2 text-sm text-red-400">
                      Bloquant : {entry.quality.blockers.join(" ; ")}
                    </p>
                  )}

                  <ul className="mt-3 flex flex-wrap gap-2">
                    {entry.quality.criteria.map((criterion) => (
                      <li
                        key={criterion.key}
                        title={criterion.notes.join(" ; ") || "Rien à signaler"}
                        className={`rounded-md border px-2 py-1 text-xs ${
                          criterion.points === criterion.max
                            ? "border-zinc-800 text-zinc-500"
                            : "border-amber-500/30 text-amber-300"
                        }`}
                      >
                        {criterion.label} {criterion.points}/{criterion.max}
                        {criterion.notes.length > 0 && ` — ${criterion.notes.join(" ; ")}`}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
