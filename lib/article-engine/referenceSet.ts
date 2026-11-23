/**
 * Jeu de référence de la qualité éditoriale (étape 1 de la feuille de route).
 *
 * Une trentaine d’observations réelles, réparties par rubrique et par type de
 * source, sont annotées par l’utilisateur : faits qu’un bon article doit dire,
 * erreurs qu’il ne doit pas commettre. Un article rédigé à partir d’une de
 * ces observations est ensuite contrôlé automatiquement contre l’annotation.
 *
 * Fonctions pures et déterministes, sans appel à un modèle d’IA.
 */

/** Taille visée du jeu de référence. */
export const REFERENCE_SET_SIZE = 30;

/** Part minimale d’articles conformes pour sortir de l’étape 1 (9 sur 10). */
export const REFERENCE_SET_TARGET_RATIO = 0.9;

/** Longueur du texte de la source pour qu’une observation soit retenue. */
export const REFERENCE_CONTENT_MIN_LENGTH = 400;
export const REFERENCE_CONTENT_MAX_LENGTH = 8000;

const STOP_WORDS = new Set([
  "les", "des", "une", "est", "sont", "pour", "par", "sur", "dans", "avec", "qui",
  "que", "aux", "ses", "son", "leur", "leurs", "pas", "plus", "été", "ete", "the",
  "del", "els", "per", "amb", "dels", "las", "los", "con", "por",
]);

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .toLowerCase()
    .replace(/(\d)[\s  .](\d{3})(?!\d)/gu, "$1$2")
    .replace(/(\d)[\s  .](\d{3})(?!\d)/gu, "$1$2")
    .replace(/(\d),(\d)/gu, "$1.$2")
    .replace(/[^\p{L}\p{N}.]+/gu, " ")
    .replace(/\.(?!\d)|(?<!\d)\./gu, " ")
    .trim();
}

function tokens(value: string): string[] {
  return normalize(value).split(" ").filter(Boolean);
}

function stem(token: string): string {
  return /\p{L}/u.test(token) && token.length > 4 ? token.replace(/[sx]$/u, "").replace(/e$/u, "") : token;
}

/** Mots qui portent le fait : chiffres et mots d’au moins trois lettres. */
function keyTokens(value: string): string[] {
  return tokens(value).filter(
    (token) => /\d/u.test(token) || (token.length >= 3 && !STOP_WORDS.has(token)),
  );
}

/** Un fait par ligne ; les lignes vides et les puces sont ignorées. */
export function parseReferenceLines(value: string): string[] {
  return value
    .split(/\r?\n/u)
    .map((line) => line.replace(/^\s*[-*•·]\s*/u, "").trim())
    .filter(Boolean);
}

/**
 * Un fait est présent quand tous ses mots clés figurent dans le texte. Des
 * formulations équivalentes se séparent par « | » (« Govern | Gouvernement »).
 */
export function textStatesFact(text: string, fact: string): boolean {
  const available = new Set(tokens(text).map(stem));

  return fact
    .split("|")
    .map((alternative) => keyTokens(alternative))
    .filter((alternative) => alternative.length > 0)
    .some((alternative) => alternative.every((token) => available.has(stem(token))));
}

export type ReferenceAnnotation = {
  requiredFacts: string;
  forbiddenErrors: string;
};

export type ReferenceCheck = {
  /** Faits obligatoires absents de l’article. */
  missingFacts: string[];
  /** Erreurs interdites présentes dans l’article. */
  forbiddenFound: string[];
  /** Tous les faits sont là et aucune erreur. */
  conforms: boolean;
};

export function checkAgainstReference(
  article: { title: string; description: string; content: string },
  annotation: ReferenceAnnotation,
): ReferenceCheck {
  const text = [article.title, article.description, article.content].join("\n");
  const missingFacts = parseReferenceLines(annotation.requiredFacts).filter(
    (fact) => !textStatesFact(text, fact),
  );
  const forbiddenFound = parseReferenceLines(annotation.forbiddenErrors).filter((error) =>
    textStatesFact(text, error),
  );

  return {
    missingFacts,
    forbiddenFound,
    conforms: missingFacts.length === 0 && forbiddenFound.length === 0,
  };
}

export function isReferenceAnnotated(annotation: ReferenceAnnotation): boolean {
  return parseReferenceLines(annotation.requiredFacts).length > 0;
}

export type ReferenceCandidate = {
  id: number;
  sourceId: number;
  category: string;
  organizationType: string;
  contentLength: number;
  publishedAt: Date | null;
  collectedAt: Date;
};

function groupKey(candidate: ReferenceCandidate): string {
  return `${candidate.category}\u0000${candidate.organizationType}`;
}

function recency(candidate: ReferenceCandidate): number {
  return (candidate.publishedAt ?? candidate.collectedAt).getTime();
}

/**
 * Choisit les observations à ajouter au jeu : réparties à tour de rôle entre
 * les couples rubrique × type de source, les plus récentes d’abord, en
 * variant les sources à l’intérieur de chaque couple. Les observations déjà
 * dans le jeu comptent dans la répartition.
 */
export function selectReferenceObservations(
  candidates: readonly ReferenceCandidate[],
  existing: readonly ReferenceCandidate[] = [],
  size = REFERENCE_SET_SIZE,
): number[] {
  const taken = new Set(existing.map((candidate) => candidate.id));
  const groups = new Map<string, ReferenceCandidate[]>();

  for (const candidate of candidates) {
    if (taken.has(candidate.id)) continue;
    if (
      candidate.contentLength < REFERENCE_CONTENT_MIN_LENGTH ||
      candidate.contentLength > REFERENCE_CONTENT_MAX_LENGTH
    ) {
      continue;
    }
    const key = groupKey(candidate);
    groups.set(key, [...(groups.get(key) ?? []), candidate]);
  }

  // Dans chaque couple : une observation par source à tour de rôle, la plus récente d’abord.
  const queues = new Map<string, ReferenceCandidate[]>();
  for (const [key, members] of groups) {
    const bySource = new Map<number, ReferenceCandidate[]>();
    for (const member of [...members].sort((a, b) => recency(b) - recency(a) || b.id - a.id)) {
      bySource.set(member.sourceId, [...(bySource.get(member.sourceId) ?? []), member]);
    }
    const lanes = [...bySource.values()].sort((a, b) => recency(b[0]) - recency(a[0]) || b[0].id - a[0].id);
    const queue: ReferenceCandidate[] = [];
    for (let index = 0; lanes.some((lane) => index < lane.length); index += 1) {
      for (const lane of lanes) if (index < lane.length) queue.push(lane[index]);
    }
    queues.set(key, queue);
  }

  const counts = new Map<string, number>();
  for (const candidate of existing) counts.set(groupKey(candidate), (counts.get(groupKey(candidate)) ?? 0) + 1);

  const selected: number[] = [];
  const keys = [...queues.keys()].sort();
  while (existing.length + selected.length < size) {
    const open = keys.filter((key) => (queues.get(key)?.length ?? 0) > 0);
    if (open.length === 0) break;
    // Le couple le moins représenté passe d’abord ; à égalité, l’ordre alphabétique.
    const key = open.reduce((best, current) =>
      (counts.get(current) ?? 0) < (counts.get(best) ?? 0) ? current : best,
    );
    const next = queues.get(key)!.shift()!;
    selected.push(next.id);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return selected;
}
