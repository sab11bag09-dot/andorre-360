import type {
  SourceOrganizationType,
  SourcePublicationMode,
  SourceTrustLevel,
} from "@/lib/generated/prisma/client";

import { normalizeObservationPublishedAt } from "../source-engine/observationDate";
import { isSameTopic, topicStems, topicWords } from "./topicSimilarity";

type TopicEntry = {
  id: number;
  sourceId: number;
  words: Set<string>;
  stems: Set<string>;
};

function topicEntry(observation: {
  id: number;
  title: string;
  source: { id: number };
}): TopicEntry {
  const words = topicWords(observation.title);
  return {
    id: observation.id,
    sourceId: observation.source.id,
    words,
    stems: topicStems(words),
  };
}

/**
 * Deux observations traitent le même sujet si leurs titres partagent assez de
 * mots significatifs. Entre deux sources différentes, le rapprochement
 * accepte aussi des variantes d’un même mot (même racine) : une même source
 * publie souvent des séries de titres proches sur des faits distincts
 * (bilans d’accidents, résultats sportifs), alors que deux sources
 * différentes reprennent plutôt la même information.
 */
function isSameTopicEntry(left: TopicEntry, right: TopicEntry): boolean {
  return (
    isSameTopic(left.words, right.words) ||
    (left.sourceId !== right.sourceId && isSameTopic(left.stems, right.stems))
  );
}

/**
 * Sélection déterministe des observations qu’un futur orchestrateur
 * autonome pourra transformer en articles.
 *
 * Cette fonction est pure : elle ne lit pas la base, n’appelle aucun
 * modèle d’IA et ne crée aucun article. Elle décide seulement quelles
 * observations seraient admissibles, et explique chaque refus.
 *
 * Une sélection n’est pas une autorisation de publication : la création
 * d’article réévalue ensuite ses propres règles de publication automatique.
 *
 * Les sources institutionnelles (Govern, comuns, Policia, services de
 * secours et météo) passent en premier, puis les autres sources, puis les
 * médias : une information institutionnelle publique présente moins de
 * risque juridique qu’une reprise d’article de presse. Au sein d’une même
 * priorité, l’information la plus récente passe d’abord.
 */

export type OrchestrationObservation = {
  id: number;
  title: string;
  url: string;
  publishedAt: Date | null;
  content: string | null;
  processed: boolean;
  articleId: number | null;
  source: {
    id: number;
    url: string;
    active: boolean;
    publicationMode: SourcePublicationMode;
    trustLevel: SourceTrustLevel;
    /** Type d’organisation ; une source non classée est traitée comme ordinaire. */
    organizationType?: SourceOrganizationType;
  };
};

export type SourcePriority = "institutional" | "standard" | "media";

const INSTITUTIONAL_TYPES: ReadonlySet<SourceOrganizationType> = new Set([
  "GOVERNMENT",
  "COMMUNE",
  "POLICE",
  "EMERGENCY_SERVICE",
  "WEATHER_SERVICE",
]);

const PRIORITY_RANK: Record<SourcePriority, number> = {
  institutional: 0,
  standard: 1,
  media: 2,
};

export function sourcePriorityOf(
  organizationType: SourceOrganizationType | undefined,
): SourcePriority {
  if (organizationType && INSTITUTIONAL_TYPES.has(organizationType)) {
    return "institutional";
  }
  if (organizationType === "MEDIA") return "media";
  return "standard";
}

export type ArticleOrchestrationPolicy = {
  /** Âge maximal d’une observation, mesuré depuis sa date de publication. */
  freshnessWindowHours: number;
  /** Nombre maximal d’observations retenues par exécution. */
  maxSelected: number;
  /**
   * Nombre maximal d’observations retenues pour une même source par
   * exécution, afin qu’une source très productive n’occupe pas tout le lot.
   */
  maxPerSource: number;
  /** Longueur minimale du contenu collecté, alignée sur la publication automatique. */
  minContentLength: number;
  /** Longueur minimale du titre d’origine. */
  minTitleLength: number;
};

export const DEFAULT_ARTICLE_ORCHESTRATION_POLICY: ArticleOrchestrationPolicy =
  Object.freeze({
    freshnessWindowHours: 48,
    maxSelected: 5,
    maxPerSource: 1,
    minContentLength: 280,
    minTitleLength: 12,
  });

export type ObservationSelectionReason =
  | "already_processed"
  | "already_linked_to_article"
  | "already_attempted_by_orchestrator"
  | "source_inactive"
  | "source_not_allowlisted"
  | "source_auto_mode_not_enabled"
  | "source_trust_too_low"
  | "observation_url_not_secure"
  | "observation_origin_mismatch"
  | "published_at_missing"
  | "published_at_invalid"
  | "published_at_in_future"
  | "outside_freshness_window"
  | "title_too_short"
  | "content_too_short"
  | "duplicate_of_processed_observation"
  | "duplicate_of_selected_observation"
  | "same_topic_as_processed_observation"
  | "same_topic_as_selected_observation"
  | "source_limit_reached"
  | "batch_limit_reached";

export type ObservationSelectionDecision = {
  observationId: number;
  sourceId: number;
  sourcePriority: SourcePriority;
  status: "selected" | "skipped";
  reasons: ObservationSelectionReason[];
  /** Observation du même sujet, déjà traitée ou retenue, qui motive le refus. */
  relatedObservationId?: number;
};

export type ObservationSelectionResult = {
  selectedObservationIds: number[];
  decisions: ObservationSelectionDecision[];
  policy: ArticleOrchestrationPolicy;
};

const TRUSTED_LEVELS: ReadonlySet<SourceTrustLevel> = new Set([
  "HIGH",
  "OFFICIAL",
]);

export function selectObservationsForArticles(input: {
  observations: OrchestrationObservation[];
  allowlistedSourceIds: number[];
  /** Observations déjà réservées par une exécution précédente, réussie ou non. */
  attemptedObservationIds?: number[];
  now: Date;
  policy?: ArticleOrchestrationPolicy;
}): ObservationSelectionResult {
  const policy = input.policy ?? DEFAULT_ARTICLE_ORCHESTRATION_POLICY;
  assertValidPolicy(policy);

  if (Number.isNaN(input.now.getTime())) {
    throw new Error("Date de référence de l’orchestrateur invalide.");
  }

  const allowlist = new Set(input.allowlistedSourceIds);
  const attempted = new Set(input.attemptedObservationIds ?? []);
  const ordered = [...input.observations].sort(compareObservations);

  // Les observations déjà traitées servent de référence anti-doublon.
  const processedKeys = new Set<string>();
  const processedTopics: TopicEntry[] = [];
  for (const observation of ordered) {
    if (observation.processed || observation.articleId !== null) {
      for (const key of duplicateKeys(observation)) processedKeys.add(key);
      processedTopics.push(topicEntry(observation));
    }
  }
  const selectedTopics: TopicEntry[] = [];

  const selectedKeys = new Set<string>();
  const selectedObservationIds: number[] = [];
  const selectedPerSource = new Map<number, number>();
  const decisionsById = new Map<number, ObservationSelectionDecision>();

  for (const observation of ordered) {
    const reasons = eligibilityReasons(
      observation,
      allowlist,
      input.now,
      policy,
    );
    // Une observation déjà tentée ne doit jamais occuper la limite du lot.
    if (attempted.has(observation.id)) {
      reasons.unshift("already_attempted_by_orchestrator");
    }

    let relatedObservationId: number | undefined;

    if (reasons.length === 0) {
      const keys = duplicateKeys(observation);
      const topic = topicEntry(observation);
      const sameTopicAs = (topics: TopicEntry[]) =>
        topics.find((other) => isSameTopicEntry(topic, other))?.id;

      if (keys.some((key) => processedKeys.has(key))) {
        reasons.push("duplicate_of_processed_observation");
      } else if (keys.some((key) => selectedKeys.has(key))) {
        reasons.push("duplicate_of_selected_observation");
      } else if (
        (relatedObservationId = sameTopicAs(processedTopics)) !== undefined
      ) {
        reasons.push("same_topic_as_processed_observation");
      } else if (
        (relatedObservationId = sameTopicAs(selectedTopics)) !== undefined
      ) {
        reasons.push("same_topic_as_selected_observation");
      } else if (
        (selectedPerSource.get(observation.source.id) ?? 0) >=
        policy.maxPerSource
      ) {
        reasons.push("source_limit_reached");
      } else if (selectedObservationIds.length >= policy.maxSelected) {
        reasons.push("batch_limit_reached");
      } else {
        for (const key of keys) selectedKeys.add(key);
        selectedTopics.push(topic);
        selectedObservationIds.push(observation.id);
        selectedPerSource.set(
          observation.source.id,
          (selectedPerSource.get(observation.source.id) ?? 0) + 1,
        );
      }
    }

    decisionsById.set(observation.id, {
      observationId: observation.id,
      sourceId: observation.source.id,
      sourcePriority: sourcePriorityOf(observation.source.organizationType),
      status: reasons.length === 0 ? "selected" : "skipped",
      reasons,
      ...(relatedObservationId !== undefined ? { relatedObservationId } : {}),
    });
  }

  const decisions = [...decisionsById.values()].sort(
    (left, right) => left.observationId - right.observationId,
  );

  return { selectedObservationIds, decisions, policy };
}

function eligibilityReasons(
  observation: OrchestrationObservation,
  allowlist: ReadonlySet<number>,
  now: Date,
  policy: ArticleOrchestrationPolicy,
): ObservationSelectionReason[] {
  const reasons: ObservationSelectionReason[] = [];
  const { source } = observation;

  if (observation.processed) reasons.push("already_processed");
  if (observation.articleId !== null) {
    reasons.push("already_linked_to_article");
  }
  if (!source.active) reasons.push("source_inactive");
  if (!allowlist.has(source.id)) reasons.push("source_not_allowlisted");
  if (source.publicationMode !== "AUTO") {
    reasons.push("source_auto_mode_not_enabled");
  }
  if (!TRUSTED_LEVELS.has(source.trustLevel)) {
    reasons.push("source_trust_too_low");
  }

  const observationUrl = parseUrl(observation.url);
  if (observationUrl?.protocol !== "https:") {
    reasons.push("observation_url_not_secure");
  } else if (observationUrl.origin !== parseUrl(source.url)?.origin) {
    reasons.push("observation_origin_mismatch");
  }

  const dateReason = publishedAtReason(observation.publishedAt, now, policy);
  if (dateReason) reasons.push(dateReason);

  if (observation.title.trim().length < policy.minTitleLength) {
    reasons.push("title_too_short");
  }
  if ((observation.content?.trim().length ?? 0) < policy.minContentLength) {
    reasons.push("content_too_short");
  }

  return reasons;
}

function publishedAtReason(
  publishedAt: Date | null,
  now: Date,
  policy: ArticleOrchestrationPolicy,
): ObservationSelectionReason | null {
  // Une date absente n’est jamais remplacée par la date du jour.
  if (publishedAt === null) return "published_at_missing";
  if (Number.isNaN(publishedAt.getTime())) return "published_at_invalid";

  // Même tolérance que la normalisation appliquée à la collecte.
  if (normalizeObservationPublishedAt(publishedAt, now) === null) {
    return "published_at_in_future";
  }

  const ageMs = now.getTime() - publishedAt.getTime();
  if (ageMs > policy.freshnessWindowHours * 60 * 60 * 1_000) {
    return "outside_freshness_window";
  }

  return null;
}

function compareObservations(
  left: OrchestrationObservation,
  right: OrchestrationObservation,
): number {
  const leftRank = PRIORITY_RANK[sourcePriorityOf(left.source.organizationType)];
  const rightRank =
    PRIORITY_RANK[sourcePriorityOf(right.source.organizationType)];

  if (leftRank !== rightRank) return leftRank - rightRank;

  const leftTime = validTime(left.publishedAt);
  const rightTime = validTime(right.publishedAt);

  if (leftTime !== rightTime) return rightTime - leftTime;
  return left.id - right.id;
}

function validTime(date: Date | null): number {
  const time = date?.getTime();
  return time === undefined || Number.isNaN(time)
    ? Number.NEGATIVE_INFINITY
    : time;
}

function duplicateKeys(observation: OrchestrationObservation): string[] {
  const keys: string[] = [];
  const title = normalizeTitle(observation.title);
  if (title) keys.push(`title:${title}`);

  const url = parseUrl(observation.url);
  if (url) {
    keys.push(
      `url:${url.host.toLowerCase()}${url.pathname.replace(/\/+$/, "")}${url.search}`,
    );
  }

  return keys;
}

function normalizeTitle(title: string): string {
  return title
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function parseUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function assertValidPolicy(policy: ArticleOrchestrationPolicy): void {
  const positive = (value: number) => Number.isFinite(value) && value > 0;

  if (
    !positive(policy.freshnessWindowHours) ||
    !Number.isInteger(policy.maxSelected) ||
    policy.maxSelected <= 0 ||
    !Number.isInteger(policy.maxPerSource) ||
    policy.maxPerSource <= 0 ||
    !Number.isInteger(policy.minContentLength) ||
    policy.minContentLength < 0 ||
    !Number.isInteger(policy.minTitleLength) ||
    policy.minTitleLength < 0
  ) {
    throw new Error("Politique de l’orchestrateur d’articles invalide.");
  }
}
