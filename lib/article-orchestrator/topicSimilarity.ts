/**
 * Rapprochement par sujet de deux observations, à partir de leurs titres.
 *
 * L’anti-doublon exact compare les titres normalisés et les adresses : il ne
 * repère pas un même sujet traité par deux sources avec des titres
 * différents (cas réel du 19 novembre 2026 : la Creu dels Set Braços de
 * Jaume Bartumeu, publiée par le Diari puis par le Govern).
 *
 * Deux titres traitent le même sujet lorsqu’ils partagent au moins
 * `MIN_SHARED_TOPIC_WORDS` mots significatifs, et que ces mots couvrent au
 * moins `MIN_TOPIC_OVERLAP` des mots significatifs du titre le plus court.
 * Les mots outils (catalan, espagnol, français), les mots trop courts, les
 * années et les noms très fréquents (Andorra, Govern, paroisses) sont
 * ignorés.
 *
 * Fonction pure et déterministe, sans appel à un modèle d’IA. Elle compare
 * des titres dans une même langue ; deux titres de langues différentes ne
 * sont généralement pas rapprochés.
 */

export const MIN_SHARED_TOPIC_WORDS = 3;
export const MIN_TOPIC_OVERLAP = 0.6;
const MIN_WORD_LENGTH = 4;

const IGNORED_WORDS: ReadonlySet<string> = new Set(
  `
  aquest aquesta aquests aquestes amb anys cada com como cómo contre dans dels dins
  durant entre esta este estas estos fins lors mais menys molt molta molts moltes
  nous nova noves nuevo nueva nuevos nuevas nouveau nouvelle nouveaux nouvelles
  para pels perque però pero plus pour poder pourra podrà quan quand que qui
  sans segons selon seva seus seves sobre sont tots totes tota todo toda todos
  todas tous toutes tout toute tres très una unes unos unas avec cette ces leur
  leurs aquí aqui així asi des del las los les els
  andorra andorre andorran andorrana andorrans andorranes andorrano andorrana
  principat principado principaute govern gobierno gouvernement comu
  canillo encamp ordino massana escaldes engordany vella sant julia loria
  `
    .split(/\s+/u)
    .filter(Boolean)
    .map(normalizeWord),
);

function normalizeWord(word: string): string {
  return word.normalize("NFD").replace(/\p{M}+/gu, "").toLowerCase();
}

function isYear(word: string): boolean {
  return /^(19|20)\d{2}$/u.test(word);
}

/** Mots significatifs d’un titre, sans doublons. */
export function topicWords(title: string): Set<string> {
  const words = normalizeWord(title)
    .split(/[^\p{L}\p{N}]+/u)
    .filter(
      (word) =>
        word.length >= MIN_WORD_LENGTH ||
        (/^\p{N}+$/u.test(word) && word.length >= 3),
    )
    .filter((word) => !isYear(word) && !IGNORED_WORDS.has(word));

  return new Set(words);
}

export function isSameTopic(
  left: ReadonlySet<string>,
  right: ReadonlySet<string>,
): boolean {
  if (left.size === 0 || right.size === 0) return false;

  let shared = 0;
  for (const word of left) if (right.has(word)) shared += 1;

  return (
    shared >= MIN_SHARED_TOPIC_WORDS &&
    shared / Math.min(left.size, right.size) >= MIN_TOPIC_OVERLAP
  );
}
