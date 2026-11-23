/**
 * Contrôle de fidélité d’un article rédigé à partir d’une liste de faits.
 *
 * - Chiffres : chaque nombre de l’article (titre, chapô, corps) doit figurer
 *   dans la liste de faits, éventuellement écrit autrement (« 19.30 heures »
 *   et « 19 h 30 », « deux » et « 2 », « 1 200 000 » et « 1200000 »), ou
 *   provenir des dates fournies au rédacteur comme contexte (date de la
 *   source, date de génération). Un chiffre absent bloque l’article : c’est
 *   le signe d’une information inventée.
 * - Noms propres : un nom absent des faits et du nom de la source est
 *   seulement signalé « à vérifier ». Le calibrage du 19 novembre 2026 a
 *   montré que ces écarts sont surtout des traductions légitimes
 *   (« Andorre-la-Vieille ») ou des sigles développés (« Caisse andorrane… »).
 *
 * Fonctions pures et déterministes, sans appel à un modèle d’IA.
 */

export type FactFidelityInput = {
  article: { title: string; description: string; content: string };
  facts: readonly string[];
  sourceName: string;
  /** Dates transmises au rédacteur (date de la source, date de génération). */
  contextDates: ReadonlyArray<Date | null>;
};

export type FactFidelityResult = {
  /** Nombres de l’article absents des faits et du contexte : bloquants. */
  unsupportedNumbers: string[];
  /** Noms propres absents des faits et du nom de la source : à vérifier. */
  namesToCheck: string[];
};

const NUMBER_WORDS: Readonly<Record<string, string>> = {
  un: "1", une: "1", premier: "1", premiere: "1", deux: "2", trois: "3",
  quatre: "4", cinq: "5", six: "6", sept: "7", huit: "8", neuf: "9",
  dix: "10", onze: "11", douze: "12", treize: "13", quatorze: "14",
  quinze: "15", seize: "16", vingt: "20", trente: "30", quarante: "40",
  cinquante: "50", soixante: "60", cent: "100", mille: "1000",
};

/** Noms français usuels de lieux andorrans, ramenés au nom officiel. */
const PLACE_EXONYMS: Readonly<Record<string, string>> = {
  andorre: "andorra",
  "andorre-la-vieille": "andorra la vella",
  "saint-julien-de-loria": "sant julia de loria",
};

const ELISION = /^(?:[dlnsjmtc]|qu|jusqu|lorsqu|puisqu)['’]/iu;

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .toLowerCase()
    .replace(/’/g, "'");
}

/**
 * Supprime les séparateurs de milliers : « 1 200 000 » devient « 1200000 ».
 * Le point de milliers des sources catalanes et espagnoles est aussi
 * reconnu : « 14.400 euros » est le même nombre que « 14 400 euros ». Un
 * point suivi de moins de trois chiffres (« 19.30 heures ») ne change pas.
 */
function joinThousands(value: string): string {
  let previous: string;
  let current = value;
  do {
    previous = current;
    current = current
      .replace(/(\d)[   ](\d{3})(?!\d)/gu, "$1$2")
      .replace(/(\d)\.(\d{3})(?!\d)/gu, "$1$2");
  } while (current !== previous);
  return current;
}

function canonicalNumber(run: string): string {
  return run.replace(/^0+(?=\d)/u, "");
}

function numberRuns(value: string): string[] {
  return [...joinThousands(value).matchAll(/\d+/gu)].map((match) =>
    canonicalNumber(match[0]),
  );
}

function contextDateNumbers(date: Date): string[] {
  const numbers = [
    date.getUTCDate(),
    date.getUTCMonth() + 1,
    date.getUTCFullYear(),
  ].map(String);

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Andorra",
    day: "numeric",
    month: "numeric",
    year: "numeric",
  }).formatToParts(date);
  for (const part of parts) {
    if (part.type !== "literal") numbers.push(canonicalNumber(part.value));
  }

  return numbers;
}

const FRENCH_MONTHS = [
  "janvier", "fevrier", "mars", "avril", "mai", "juin",
  "juillet", "aout", "septembre", "octobre", "novembre", "decembre",
];

const DAY = 24 * 60 * 60 * 1000;

/** Écart maximal entre une date déduite d’un mot relatif et la date de contexte. */
const RELATIVE_DATE_WINDOW_DAYS = 10;

const ARTICLE_DATE = new RegExp(
  "(?:(?<!\\d)(\\d{1,2})(?:er)?(?:\\s*(?:,|et|au|a|-)\\s*(?:le\\s+)?(\\d{1,2})(?:er)?)?\\s+)?" +
    `(?<!\\p{L})(${FRENCH_MONTHS.join("|")})(?!\\p{L})(?:\\s+(\\d{4})(?!\\d))?`,
  "gu",
);

/**
 * Chiffres des dates absolues que le rédacteur a déduites, comme on le lui
 * demande, d’une expression relative ou d’une date sans année :
 * « ce samedi » → « 16 mai 2026 », « l’11 de març » → « 11 mars 2027 ».
 *
 * - Une année accolée à un mois est admise si elle est celle d’une date de
 *   contexte, la précédente ou la suivante.
 * - Un jour est admis si la date qu’il forme tombe à moins de dix jours
 *   d’une date de contexte.
 *
 * Tout autre chiffre, y compris un jour éloigné, doit figurer dans les faits.
 */
function inferredDateNumbers(input: FactFidelityInput): Set<string> {
  const allowed = new Set<string>();
  const contexts = input.contextDates.filter(
    (date): date is Date => date !== null && !Number.isNaN(date.getTime()),
  );
  if (contexts.length === 0) return allowed;

  const years = new Set(
    contexts.flatMap((date) => {
      const year = date.getUTCFullYear();
      return [year - 1, year, year + 1];
    }),
  );

  for (const text of articleText(input)) {
    for (const match of normalize(text).matchAll(ARTICLE_DATE)) {
      const [, firstDay, secondDay, monthName, yearText] = match;
      const month = FRENCH_MONTHS.indexOf(monthName);
      const year = yearText ? Number(yearText) : null;
      if (year !== null && years.has(year)) allowed.add(String(year));

      for (const dayText of [firstDay, secondDay]) {
        if (!dayText) continue;
        const day = Number(dayText);
        const close = contexts.some((context) => {
          const candidates = year !== null
            ? [year]
            : [context.getUTCFullYear() - 1, context.getUTCFullYear(), context.getUTCFullYear() + 1];
          return candidates.some(
            (candidate) =>
              Math.abs(Date.UTC(candidate, month, day) - context.getTime()) <=
              RELATIVE_DATE_WINDOW_DAYS * DAY,
          );
        });
        if (close) allowed.add(canonicalNumber(dayText));
      }
    }
  }

  return allowed;
}

function allowedNumbers(input: FactFidelityInput): Set<string> {
  const allowed = new Set<string>();

  for (const fact of input.facts) {
    for (const run of numberRuns(fact)) allowed.add(run);
    for (const word of normalize(fact).split(/[^\p{L}]+/u)) {
      const digits = NUMBER_WORDS[word];
      if (digits) allowed.add(digits);
    }
  }

  for (const date of input.contextDates) {
    if (date && !Number.isNaN(date.getTime())) {
      for (const number of contextDateNumbers(date)) allowed.add(number);
    }
  }

  for (const number of inferredDateNumbers(input)) allowed.add(number);

  return allowed;
}

function articleText(input: FactFidelityInput): string[] {
  return [input.article.title, input.article.description, input.article.content];
}

function properNames(text: string): string[] {
  const names: string[] = [];

  for (const sentence of text.split(/(?<=[.!?:;…])\s+|\n+/u)) {
    const tokens = sentence.split(/[\s,()«»"“”[\]]+/u).filter(Boolean);
    tokens.forEach((token, index) => {
      if (index === 0) return;
      const word = token.replace(ELISION, "").replace(/[.,;:!?…]+$/u, "");
      if (word.length > 1 && /^\p{Lu}/u.test(word)) names.push(word);
    });
  }

  return names;
}

function isKnownName(name: string, words: Set<string>, text: string): boolean {
  const normalized = normalize(name);
  if (words.has(normalized)) return true;

  const exonym = PLACE_EXONYMS[normalized];
  if (exonym && ` ${text} `.includes(` ${exonym} `)) return true;

  const parts = normalized.split("-").filter(Boolean);
  return parts.length > 1 && parts.every((part) => words.has(part));
}

export function checkFactFidelity(input: FactFidelityInput): FactFidelityResult {
  const allowed = allowedNumbers(input);
  const unsupportedNumbers: string[] = [];
  for (const text of articleText(input)) {
    for (const run of numberRuns(text)) {
      if (!allowed.has(run) && !unsupportedNumbers.includes(run)) {
        unsupportedNumbers.push(run);
      }
    }
  }

  const reference = normalize([...input.facts, input.sourceName].join(" "))
    .replace(/[^\p{L}\p{N}'·-]+/gu, " ");
  const words = new Set(
    reference.split(/[\s']+/u).filter(Boolean),
  );
  const flatReference = reference.replace(/[-']/g, " ").replace(/\s+/g, " ");

  const namesToCheck: string[] = [];
  for (const text of articleText(input)) {
    for (const name of properNames(text)) {
      if (!isKnownName(name, words, flatReference) && !namesToCheck.includes(name)) {
        namesToCheck.push(name);
      }
    }
  }

  return { unsupportedNumbers, namesToCheck };
}

export function describeFactFidelity(result: FactFidelityResult): string {
  return `chiffres absents de la liste de faits : ${result.unsupportedNumbers.join(", ")}`;
}
