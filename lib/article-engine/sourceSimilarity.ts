/**
 * Contrôle automatique de ressemblance entre un article rédigé et son texte
 * source.
 *
 * La mesure compare des suites de mots après normalisation (casse, accents,
 * ponctuation, apostrophes) :
 * - la part des passages de N mots de l’article qui figurent aussi dans la
 *   source ;
 * - le plus long passage commun, en nombre de mots consécutifs.
 *
 * Limite assumée : cette comparaison repère la reprise de formulations dans
 * la même langue. Elle ne repère pas une traduction fidèle d’une source
 * rédigée dans une autre langue ; la rédaction à partir d’une liste de faits
 * traite ce cas en amont. Ce contrôle réduit le risque juridique sans le
 * trancher.
 */

export type SourceSimilarityPolicy = {
  /** Longueur, en mots, des passages comparés. */
  shingleSize: number;
  /** Part maximale des passages de l’article présents dans la source. */
  maxSharedShingleRatio: number;
  /** Longueur maximale, en mots, d’un passage commun. */
  maxSharedRunWords: number;
};

export const DEFAULT_SOURCE_SIMILARITY_POLICY: SourceSimilarityPolicy =
  Object.freeze({
    shingleSize: 5,
    maxSharedShingleRatio: 0.2,
    maxSharedRunWords: 12,
  });

export type SourceSimilarityMeasure = {
  shingleSize: number;
  articleShingleCount: number;
  sharedShingleCount: number;
  /** Arrondi à quatre décimales. */
  sharedShingleRatio: number;
  longestSharedRun: number;
};

export type SourceSimilarityReason =
  | "shared_passages_ratio_too_high"
  | "shared_run_too_long";

export type SourceSimilarityEvaluation = {
  blocked: boolean;
  reasons: SourceSimilarityReason[];
};

/** Au-delà, la source est tronquée pour borner le calcul. */
const MAX_COMPARED_WORDS = 20_000;

export function tokenizeForSimilarity(value: string): string[] {
  return value
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
    .slice(0, MAX_COMPARED_WORDS);
}

export function measureSourceSimilarity(
  source: { title: string; content: string },
  article: { title: string; description: string; content: string },
  policy: SourceSimilarityPolicy = DEFAULT_SOURCE_SIMILARITY_POLICY,
): SourceSimilarityMeasure {
  const size = policy.shingleSize;
  const sourceWords = tokenizeForSimilarity(
    `${source.title}\n${source.content}`,
  );
  // Le titre, le chapô et le corps sont comparés séparément : un passage
  // ne doit pas être formé à cheval sur deux parties de l’article.
  const articleParts = [article.title, article.description, article.content]
    .map(tokenizeForSimilarity)
    .filter((words) => words.length > 0);

  const sourceShingles = new Set(shingles(sourceWords, size));
  let articleShingleCount = 0;
  let sharedShingleCount = 0;
  let longestSharedRun = 0;

  for (const words of articleParts) {
    for (const shingle of shingles(words, size)) {
      articleShingleCount += 1;
      if (sourceShingles.has(shingle)) sharedShingleCount += 1;
    }
    longestSharedRun = Math.max(
      longestSharedRun,
      longestCommonRun(words, sourceWords),
    );
  }

  return {
    shingleSize: size,
    articleShingleCount,
    sharedShingleCount,
    sharedShingleRatio:
      articleShingleCount === 0
        ? 0
        : Math.round((sharedShingleCount / articleShingleCount) * 10_000) /
          10_000,
    longestSharedRun,
  };
}

export function evaluateSourceSimilarity(
  measure: SourceSimilarityMeasure,
  policy: SourceSimilarityPolicy = DEFAULT_SOURCE_SIMILARITY_POLICY,
): SourceSimilarityEvaluation {
  const reasons: SourceSimilarityReason[] = [];

  if (measure.sharedShingleRatio > policy.maxSharedShingleRatio) {
    reasons.push("shared_passages_ratio_too_high");
  }
  if (measure.longestSharedRun > policy.maxSharedRunWords) {
    reasons.push("shared_run_too_long");
  }

  return { blocked: reasons.length > 0, reasons };
}

export function describeSourceSimilarity(
  measure: SourceSimilarityMeasure,
): string {
  const percent = Math.round(measure.sharedShingleRatio * 100);
  return (
    `${percent} % de passages de ${measure.shingleSize} mots communs, ` +
    `plus long passage commun : ${measure.longestSharedRun} mots`
  );
}

function shingles(words: string[], size: number): string[] {
  const result: string[] = [];
  for (let index = 0; index + size <= words.length; index += 1) {
    result.push(words.slice(index, index + size).join(" "));
  }
  return result;
}

/** Plus longue suite de mots consécutifs commune aux deux textes. */
function longestCommonRun(left: string[], right: string[]): number {
  if (left.length === 0 || right.length === 0) return 0;

  let previous = new Uint32Array(right.length + 1);
  let current = new Uint32Array(right.length + 1);
  let longest = 0;

  for (let i = 1; i <= left.length; i += 1) {
    for (let j = 1; j <= right.length; j += 1) {
      if (left[i - 1] === right[j - 1]) {
        const run = previous[j - 1]! + 1;
        current[j] = run;
        if (run > longest) longest = run;
      } else {
        current[j] = 0;
      }
    }
    [previous, current] = [current, previous];
  }

  return longest;
}
