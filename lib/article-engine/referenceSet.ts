/**
 * Jeu de référence de la qualité éditoriale (étape 1 de la feuille de route).
 *
 * Une trentaine d’observations réelles, réparties par rubrique et par type de
 * source, sont annotées : ce qu’un bon article doit dire, rangé selon les cinq
 * questions (qui ou quoi, où, quand, comment, pourquoi), et les erreurs qu’il
 * ne doit pas commettre. Un article rédigé à partir d’une de
 * ces observations est ensuite contrôlé automatiquement contre l’annotation.
 *
 * Fonctions pures et déterministes, sans appel à un modèle d’IA.
 */

import { QUESTIONS, questionLabel, type QuestionKey } from "./fiveQuestions";

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

const NUMBER_WORDS: Readonly<Record<string, string>> = {
  deux: "2", trois: "3", quatre: "4", cinq: "5", six: "6", sept: "7", huit: "8", neuf: "9",
  dix: "10", onze: "11", douze: "12", treize: "13", quatorze: "14", quinze: "15", seize: "16",
  vingt: "20", trente: "30", quarante: "40", cinquante: "50", soixante: "60", cent: "100", mille: "1000",
  premier: "1er", premiere: "1re", deuxieme: "2e", second: "2e", seconde: "2e", troisieme: "3e",
  quatrieme: "4e", cinquieme: "5e", sixieme: "6e", septieme: "7e", huitieme: "8e", neuvieme: "9e",
  dixieme: "10e", onzieme: "11e", douzieme: "12e", treizieme: "13e", quinzieme: "15e", vingtieme: "20e",
};

/** Mots normalisés ; les nombres en lettres deviennent des chiffres (« douze » → « 12 », « cinquième » → « 5e »). */
function tokens(value: string): string[] {
  return normalize(value)
    .split(" ")
    .filter(Boolean)
    .map((token) => NUMBER_WORDS[token] ?? token.replace(/^(\d+)(?:eme|ème|e)$/u, "$1e"));
}

/** Racine d’un mot : sans marque du pluriel ni « e » final. */
function stem(token: string): string {
  return /\p{L}/u.test(token) && !/\d/u.test(token) && token.length >= 4
    ? token.replace(/[sx]$/u, "").replace(/e$/u, "")
    : token;
}

/** Mots qui portent le fait : chiffres et mots d’au moins trois lettres. */
function keyTokens(value: string): string[] {
  return tokens(value).filter(
    (token) => /\d/u.test(token) || (token.length >= 3 && !STOP_WORDS.has(token)),
  );
}

/**
 * Un mot du fait est présent quand le texte contient le même mot ou un mot de
 * même racine : « vote » couvre « votera » et « votation », « organisme »
 * couvre « organismes ». Les chiffres doivent être identiques.
 */
function tokenPresent(token: string, available: ReadonlySet<string>, availableStems: readonly string[]): boolean {
  const root = stem(token);
  if (available.has(token) || available.has(root)) return true;
  if (/\d/u.test(token) || root.length < 3) return false;
  return availableStems.some((candidate) => candidate.startsWith(root));
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
  const words = tokens(text);
  const stems = words.map(stem);
  const available = new Set([...words, ...stems]);

  return fact
    .split("|")
    .map((alternative) => keyTokens(alternative))
    .filter((alternative) => alternative.length > 0)
    .some((alternative) => alternative.every((token) => tokenPresent(token, available, stems)));
}

/** Champ de l’annotation pour chacune des cinq questions. */
export const REFERENCE_QUESTION_FIELDS = {
  who: "whoFacts",
  where: "whereFacts",
  when: "whenFacts",
  how: "howFacts",
  why: "whyFacts",
} as const satisfies Record<QuestionKey, string>;

export type ReferenceFactField = (typeof REFERENCE_QUESTION_FIELDS)[QuestionKey];

/**
 * Ce qu’un bon article doit dire, rangé par question : qui ou quoi, où,
 * quand, comment et, quand la source le dit, pourquoi.
 */
export type ReferenceAnnotation = Record<ReferenceFactField, string> & {
  forbiddenErrors: string;
};

export type ReferenceQuestionCheck = {
  key: QuestionKey;
  /** Faits attendus pour cette question ; vide quand la question est sans objet. */
  facts: string[];
  /** Faits attendus absents de l’article. */
  missing: string[];
};

export type ReferenceCheck = {
  questions: ReferenceQuestionCheck[];
  /** Faits absents, précédés de leur question : « Où ? Encamp ». */
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
  const questions = QUESTIONS.map(({ key }) => {
    const facts = parseReferenceLines(annotation[REFERENCE_QUESTION_FIELDS[key]]);
    return { key, facts, missing: facts.filter((fact) => !textStatesFact(text, fact)) };
  });
  const missingFacts = questions.flatMap(({ key, missing }) =>
    missing.map((fact) => `${questionLabel(key)} ${fact}`),
  );
  const forbiddenFound = parseReferenceLines(annotation.forbiddenErrors).filter((error) =>
    textStatesFact(text, error),
  );

  return {
    questions,
    missingFacts,
    forbiddenFound,
    conforms: missingFacts.length === 0 && forbiddenFound.length === 0,
  };
}

export function isReferenceAnnotated(annotation: ReferenceAnnotation): boolean {
  return QUESTIONS.some(({ key }) => parseReferenceLines(annotation[REFERENCE_QUESTION_FIELDS[key]]).length > 0);
}

export type ReferenceCandidate = {
  id: number;
  sourceId: number;
  category: string;
  organizationType: string;
  title: string;
  content: string;
  publishedAt: Date | null;
  collectedAt: Date;
};

function groupKey(candidate: ReferenceCandidate): string {
  return `${candidate.category}\u0000${candidate.organizationType}`;
}

/**
 * Une observation qui n’est pas un article : page de service au titre de un
 * à trois mots (« Col·laboradors », « Fes voluntariat »), extrait tronqué d’un
 * flux, ou texte resté en HTML. Les titres courts écartent aussi la plupart
 * des chroniques d’opinion (« Quin privilegi! »), et parfois une brève : sans
 * conséquence pour un jeu de trente observations.
 */
export function looksLikeArticle(candidate: Pick<ReferenceCandidate, "title" | "content">): boolean {
  const words = candidate.title.split(/\s+/u).filter((word) => /\p{L}/u.test(word));
  const content = candidate.content.trim();
  if (words.length < 4) return false;
  if (/first appeared on|<\/?p>|&#\d+;/iu.test(content)) return false;
  if (/(?:\[…\]|\[\.\.\.\]|\[&#8230;\])\s*$/u.test(content)) return false;
  return content.length >= REFERENCE_CONTENT_MIN_LENGTH && content.length <= REFERENCE_CONTENT_MAX_LENGTH;
}

/**
 * Empreintes d’une observation : même titre, même début de texte, ou même
 * suite de chiffres. La dernière repère un même communiqué publié dans une
 * autre langue par plusieurs sources (« 47e Fira », « 9 décembre », « 400 € »).
 */
export function referenceFingerprints(candidate: Pick<ReferenceCandidate, "title" | "content">): string[] {
  const title = tokens(candidate.title).join(" ");
  const opening = tokens(candidate.content).slice(0, 40).join(" ");
  // Les ordinaux perdent leur marque, propre à chaque langue (« 47a », « 47e »).
  const numbers = tokens(candidate.content)
    .filter((token) => /^\d/u.test(token))
    .map((token) => token.replace(/\D+$/u, ""));
  const fingerprints = [`titre:${title}`, `texte:${opening}`];
  if (numbers.length >= 5) fingerprints.push(`chiffres:${numbers.slice(0, 12).join(" ")}`);
  return fingerprints;
}

function recency(candidate: ReferenceCandidate): number {
  return (candidate.publishedAt ?? candidate.collectedAt).getTime();
}

/**
 * Choisit les observations à ajouter au jeu : réparties à tour de rôle entre
 * les couples rubrique × type de source, les plus récentes d’abord, en
 * variant les sources à l’intérieur de chaque couple. Les observations déjà
 * dans le jeu comptent dans la répartition. Sont écartés les textes qui ne
 * sont pas des articles et les doublons d’une observation déjà retenue.
 */
export function selectReferenceObservations(
  candidates: readonly ReferenceCandidate[],
  existing: readonly ReferenceCandidate[] = [],
  size = REFERENCE_SET_SIZE,
): number[] {
  const taken = new Set(existing.map((candidate) => candidate.id));
  const groups = new Map<string, ReferenceCandidate[]>();

  for (const candidate of candidates) {
    if (taken.has(candidate.id) || !looksLikeArticle(candidate)) continue;
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

  const seen = new Set(existing.flatMap(referenceFingerprints));
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
    const fingerprints = referenceFingerprints(next);
    if (fingerprints.some((fingerprint) => seen.has(fingerprint))) continue;
    for (const fingerprint of fingerprints) seen.add(fingerprint);
    selected.push(next.id);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return selected;
}
