"use client";

import { useState, useTransition } from "react";

import {
  runHomeEditorialSimulation,
  type HomeEditorialSimulationResult,
} from "@/actions/home-editorial-simulation";
import { Button } from "@/components/admin/ui";
import type { HomeCandidateExclusion } from "@/lib/editorial/homeAutomationPolicy";
import type { HomeVisibleZone } from "@/lib/editorial/homeComposition";

const ZONE_LABELS: Record<HomeVisibleZone, string> = {
  hero: "Une principale",
  feature: "Grande carte",
  "grand-format": "Grand format",
  card: "Carte éditoriale",
  brief: "Brève",
};

const EXCLUSION_LABELS: Record<HomeCandidateExclusion, string> = {
  ARTICLE_NOT_PUBLIC: "Article non public",
  MISSING_FRENCH_VERSION: "Version française absente",
  MISSING_CATALAN_VERSION: "Version catalane absente",
  MISSING_SPANISH_VERSION: "Version espagnole absente",
  MISSING_IMAGE: "Image absente",
  UNRELIABLE_SOURCE: "Source insuffisamment fiable",
  FORBIDDEN_CATEGORY: "Catégorie interdite à l’accueil",
  DUPLICATE: "Sujet en doublon",
  DISGUISED_ADVERTISEMENT: "Contenu essentiellement promotionnel",
  EXPIRED_CONTENT: "Information périmée",
  CONTRADICTORY_SIGNALS: "Signaux contradictoires",
};

function formatGeneratedAt(value: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function HomeEditorialSimulationPanel() {
  const [result, setResult] = useState<HomeEditorialSimulationResult | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();

  function runSimulation() {
    setResult(null);

    startTransition(async () => {
      const nextResult = await runHomeEditorialSimulation();

      setResult(nextResult);
    });
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-yellow-200 bg-yellow-50 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-700">
          Mode consultatif
        </p>

        <h2 className="mt-2 font-serif text-2xl text-gray-950">
          Simuler la prochaine Une
        </h2>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-700">
          L’IA évalue jusqu’à 30 candidats. Les règles déterministes appliquent
          ensuite les seuils, la diversité et la déduplication. Cette opération
          ne modifie aucune mission éditoriale.
        </p>

        <div className="mt-5">
          <Button type="button" onClick={runSimulation} disabled={isPending}>
            {isPending ? "Simulation en cours…" : "Lancer la simulation"}
          </Button>
        </div>
      </section>

      {result && !result.success && (
        <p
          className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800"
          role="alert"
        >
          {result.message}
        </p>
      )}

      {result?.success && (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-sm text-gray-500">Candidats évalués</p>
              <p className="mt-2 text-3xl font-semibold text-gray-950">
                {result.candidateCount}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-sm text-gray-500">Articles retenus</p>
              <p className="mt-2 text-3xl font-semibold text-gray-950">
                {result.placements.length}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-sm text-gray-500">Simulation générée</p>
              <p className="mt-2 font-semibold text-gray-950">
                {formatGeneratedAt(result.generatedAt)}
              </p>
            </div>
          </section>

          <section>
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-yellow-600">
                Proposition
              </p>
              <h2 className="mt-1 font-serif text-3xl text-gray-950">
                Composition simulée
              </h2>
            </div>

            {result.placements.length === 0 ? (
              <p className="rounded-xl border border-gray-200 bg-white p-5 text-gray-600">
                Aucun candidat n’atteint les critères de sélection.
              </p>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {result.placements.map((placement) => (
                  <article
                    key={`${placement.zone}-${placement.articleId}`}
                    className="rounded-xl border border-gray-200 bg-white p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-600">
                          {ZONE_LABELS[placement.zone]}
                        </p>
                        <h3 className="mt-2 font-serif text-xl text-gray-950">
                          {placement.title}
                        </h3>
                      </div>

                      <span className="rounded-full bg-gray-950 px-3 py-1 text-sm font-semibold text-white">
                        {placement.score}/100
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-gray-500">
                      {placement.category} · {placement.sourceName}
                    </p>

                    <ul className="mt-4 space-y-1 text-sm leading-6 text-gray-700">
                      {placement.reasons.map((reason) => (
                        <li key={reason}>• {reason}</li>
                      ))}
                    </ul>

                    <a
                      href={`/admin/articles/${placement.articleId}`}
                      className="mt-4 inline-block text-sm font-semibold text-yellow-700 hover:text-yellow-800"
                    >
                      Ouvrir dans le Studio →
                    </a>
                  </article>
                ))}
              </div>
            )}
          </section>

          {Object.values(result.unfilledSlots).some((count) => count > 0) && (
            <section className="rounded-xl border border-amber-200 bg-amber-50 p-5">
              <h2 className="font-semibold text-amber-950">
                Emplacements non pourvus
              </h2>

              <div className="mt-3 flex flex-wrap gap-2">
                {Object.entries(result.unfilledSlots)
                  .filter(([, count]) => count > 0)
                  .map(([zone, count]) => (
                    <span
                      key={zone}
                      className="rounded-full border border-amber-300 bg-white px-3 py-1 text-sm text-amber-900"
                    >
                      {ZONE_LABELS[zone as HomeVisibleZone]} : {count}
                    </span>
                  ))}
              </div>
            </section>
          )}

          {result.excluded.length > 0 && (
            <section>
              <h2 className="font-serif text-2xl text-gray-950">
                Candidats exclus
              </h2>

              <div className="mt-4 space-y-3">
                {result.excluded.map((candidate) => (
                  <article
                    key={candidate.articleId}
                    className="rounded-xl border border-red-100 bg-white p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-950">
                          {candidate.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {candidate.sourceName}
                        </p>
                      </div>

                      <span className="text-sm font-semibold text-gray-700">
                        {candidate.score}/100
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {candidate.exclusions.map((exclusion) => (
                        <span
                          key={exclusion}
                          className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700"
                        >
                          {EXCLUSION_LABELS[exclusion]}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {result.unselected.length > 0 && (
            <details className="rounded-xl border border-gray-200 bg-white p-5">
              <summary className="cursor-pointer font-semibold text-gray-950">
                Candidats admissibles non retenus ({result.unselected.length})
              </summary>

              <div className="mt-4 space-y-3">
                {result.unselected.map((candidate) => (
                  <div
                    key={candidate.articleId}
                    className="border-t border-gray-100 pt-3 first:border-0 first:pt-0"
                  >
                    <p className="font-semibold text-gray-900">
                      {candidate.title}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {candidate.score}/100 · {candidate.category} ·{" "}
                      {candidate.sourceName}
                    </p>
                  </div>
                ))}
              </div>
            </details>
          )}

          <p className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm font-semibold text-gray-700">
            Proposition uniquement — aucun placement n’a été créé, déplacé ou
            désactivé.
          </p>
        </>
      )}
    </div>
  );
}
