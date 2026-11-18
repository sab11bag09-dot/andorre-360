"use client";

import { useState, useTransition } from "react";

import {
  launchArticleOrchestration,
  previewArticleOrchestration,
  type ArticleOrchestrationLaunchItemView,
  type ArticleOrchestrationLaunchResult,
  type ArticleOrchestrationObservationView,
  type ArticleOrchestrationPreviewResult,
} from "@/actions/article-orchestration";
import { Button } from "@/components/admin/ui";
import type { ArticleOrchestrationExecutionBlockReason } from "@/lib/article-orchestrator/executeArticleOrchestration";
import type { ObservationSelectionReason } from "@/lib/article-orchestrator/selectObservationsForArticles";

const REASON_LABELS: Record<ObservationSelectionReason, string> = {
  already_processed: "Déjà traitée",
  already_linked_to_article: "Déjà liée à un article",
  already_attempted_by_orchestrator: "Déjà tentée par l’orchestrateur",
  source_inactive: "Source inactive",
  source_not_allowlisted: "Source non autorisée",
  source_auto_mode_not_enabled: "Source hors mode AUTO",
  source_trust_too_low: "Source insuffisamment fiable",
  observation_url_not_secure: "Adresse non sécurisée",
  observation_origin_mismatch: "Adresse hors du site de la source",
  published_at_missing: "Date absente",
  published_at_invalid: "Date invalide",
  published_at_in_future: "Date dans le futur",
  outside_freshness_window: "Information trop ancienne",
  title_too_short: "Titre trop court",
  content_too_short: "Contenu trop court",
  duplicate_of_processed_observation: "Doublon d’une information traitée",
  duplicate_of_selected_observation: "Doublon d’une information retenue",
  source_limit_reached: "Limite par source atteinte",
  batch_limit_reached: "Limite du lot atteinte",
};

const BLOCK_LABELS: Record<ArticleOrchestrationExecutionBlockReason, string> = {
  orchestrator_disabled: "Orchestrateur désactivé (AI_ARTICLE_ORCHESTRATOR_ENABLED)",
  feature_disabled: "Publication automatique désactivée (AI_AUTO_PUBLICATION_ENABLED)",
  emergency_stop: "Arrêt d’urgence actif (AI_AUTO_PUBLICATION_EMERGENCY_STOP)",
  no_allowlisted_source: "Aucune source autorisée (AI_AUTO_PUBLICATION_SOURCE_IDS)",
};

const ITEM_STATUS_LABELS: Record<ArticleOrchestrationLaunchItemView["status"], string> = {
  CREATED: "Article créé",
  FAILED: "Échec",
  ALREADY_ATTEMPTED: "Déjà tentée",
  STOPPED: "Arrêtée par l’arrêt d’urgence",
};

/** N’affiche un lien que vers une adresse web : jamais `javascript:` ou autre. */
export function isWebUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value);
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
}

function formatDate(value: string | null): string {
  if (!value) return "Date absente";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export type ArticleOrchestrationPanelProps = {
  maxSelected: number;
  maxPerSource: number;
  freshnessWindowHours: number;
};

export default function ArticleOrchestrationPanel({
  maxSelected,
  maxPerSource,
  freshnessWindowHours,
}: ArticleOrchestrationPanelProps) {
  const [preview, setPreview] =
    useState<ArticleOrchestrationPreviewResult | null>(null);
  const [launch, setLaunch] =
    useState<ArticleOrchestrationLaunchResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function runPreview() {
    setPreview(null);
    setLaunch(null);

    startTransition(async () => {
      setPreview(await previewArticleOrchestration());
    });
  }

  function runLaunch() {
    if (!preview?.success || preview.selected.length === 0) return;

    const count = preview.selected.length;
    const confirmed = window.confirm(
      `Générer ${count} article${count > 1 ? "s" : ""} avec OpenAI ? ` +
        "Chaque article consomme des crédits OpenAI (moins de 0,20 $ estimé par article). " +
        "Le serveur recalculera la sélection et refusera si elle a changé.",
    );
    if (!confirmed) return;

    const ids = preview.selected.map(({ observationId }) => observationId);
    setLaunch(null);

    startTransition(async () => {
      setLaunch(await launchArticleOrchestration(ids));
      setPreview(null);
    });
  }

  const launchAllowed =
    preview?.success === true &&
    preview.blockedReasons.length === 0 &&
    preview.selected.length > 0;

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-yellow-200 bg-yellow-50 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-700">
          Aperçu sans coût
        </p>

        <h2 className="mt-2 font-serif text-2xl text-gray-950">
          Quelles informations deviendraient des articles ?
        </h2>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-700">
          L’aperçu applique les règles déterministes de l’orchestrateur aux
          observations des 7 derniers jours : sources autorisées et fiables,
          dates valides, fraîcheur de {freshnessWindowHours} h, contenu
          suffisant, absence de doublon, {maxPerSource} article
          {maxPerSource > 1 ? "s" : ""} au maximum par source et{" "}
          {maxSelected} au total. Il n’appelle pas OpenAI et ne modifie rien.
        </p>

        <div className="mt-5">
          <Button type="button" onClick={runPreview} disabled={isPending}>
            {isPending ? "Calcul en cours…" : "Calculer l’aperçu"}
          </Button>
        </div>
      </section>

      {preview && !preview.success && (
        <p
          className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800"
          role="alert"
        >
          {preview.message}
        </p>
      )}

      {preview?.success && (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-sm text-gray-500">Observations examinées</p>
              <p className="mt-2 text-3xl font-semibold text-gray-950">
                {preview.loadedObservationCount}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-sm text-gray-500">Articles à générer</p>
              <p className="mt-2 text-3xl font-semibold text-gray-950">
                {preview.selected.length}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-sm text-gray-500">Aperçu calculé</p>
              <p className="mt-2 font-semibold text-gray-950">
                {formatDate(preview.generatedAt)}
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-3xl text-white">
              Observations retenues
            </h2>

            {preview.selected.length === 0 ? (
              <p className="mt-4 rounded-xl border border-gray-200 bg-white p-5 text-gray-600">
                Aucune observation ne remplit les critères. Rien ne serait
                généré.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {preview.selected.map((observation) => (
                  <ObservationCard
                    key={observation.observationId}
                    observation={observation}
                  />
                ))}
              </div>
            )}
          </section>

          {Object.keys(preview.skippedByReason).length > 0 && (
            <section className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="font-semibold text-gray-950">
                Observations écartées ({preview.skippedCount})
              </h2>

              <div className="mt-3 flex flex-wrap gap-2">
                {Object.entries(preview.skippedByReason).map(([reason, count]) => (
                  <span
                    key={reason}
                    className="rounded-full border border-gray-300 bg-gray-50 px-3 py-1 text-sm text-gray-800"
                  >
                    {REASON_LABELS[reason as ObservationSelectionReason]} : {count}
                  </span>
                ))}
              </div>

              {preview.detailedSkipped.length > 0 && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-semibold text-gray-900">
                    Détail des observations écartées les plus récentes
                    ({preview.detailedSkipped.length})
                  </summary>

                  <div className="mt-3 space-y-3">
                    {preview.detailedSkipped.map((observation) => (
                      <ObservationCard
                        key={observation.observationId}
                        observation={observation}
                      />
                    ))}
                  </div>
                </details>
              )}
            </section>
          )}

          <section className="rounded-xl border border-yellow-200 bg-yellow-50 p-5">
            <h2 className="font-semibold text-gray-950">Lancement manuel</h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-700">
              Le lancement appelle OpenAI pour chaque observation retenue et
              engage donc un coût. Le serveur recalcule la sélection et refuse
              si elle diffère de cet aperçu. Chaque observation n’est tentée
              qu’une seule fois ; un échec n’est jamais relancé
              automatiquement.
            </p>

            {preview.blockedReasons.length > 0 ? (
              <div className="mt-4 text-sm text-amber-900">
                <p className="font-semibold">
                  Le lancement est fermé par les garde-fous serveur :
                </p>
                <ul className="mt-2 space-y-1">
                  {preview.blockedReasons.map((reason) => (
                    <li key={reason}>• {BLOCK_LABELS[reason]}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="mt-4">
                <Button
                  type="button"
                  onClick={runLaunch}
                  disabled={isPending || !launchAllowed}
                >
                  {isPending
                    ? "Génération en cours…"
                    : `Générer ${preview.selected.length} article${preview.selected.length > 1 ? "s" : ""}`}
                </Button>
              </div>
            )}
          </section>
        </>
      )}

      {launch && !launch.success && (
        <p
          className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800"
          role="alert"
        >
          {launch.message}
        </p>
      )}

      {launch?.success && (
        <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-950">
          <h2 className="font-semibold">Exécution terminée</h2>
          <p className="mt-1 break-all">Identifiant du run : {launch.runId}</p>

          <ul className="mt-4 space-y-2">
            {launch.items.map((item) => (
              <li key={item.observationId}>
                <span className="font-semibold">{ITEM_STATUS_LABELS[item.status]}</span>
                {" · "}
                {item.title}
                {item.articleId !== null && (
                  <>
                    {" · "}
                    <a
                      href={`/admin/articles/${item.articleId}`}
                      className="font-semibold text-yellow-800 hover:text-yellow-900"
                    >
                      Ouvrir l’article →
                    </a>
                  </>
                )}
                {item.errorMessage && (
                  <span className="block text-red-800">{item.errorMessage}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function ObservationCard({
  observation,
}: {
  observation: ArticleOrchestrationObservationView;
}) {
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="font-semibold text-gray-950">{observation.title}</h3>
      <p className="mt-1 text-sm text-gray-500">
        {observation.sourceName} · {formatDate(observation.publishedAt)}
      </p>

      {observation.reasons.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {observation.reasons.map((reason) => (
            <span
              key={reason}
              className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700"
            >
              {REASON_LABELS[reason]}
            </span>
          ))}
        </div>
      )}

      {isWebUrl(observation.url) && (
        <a
          href={observation.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-sm font-semibold text-yellow-700 hover:text-yellow-800"
        >
          Voir la source →
        </a>
      )}
    </article>
  );
}
