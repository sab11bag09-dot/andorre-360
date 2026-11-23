/**
 * Les cinq questions d’un bon article (critère éditorial du 23 novembre
 * 2026) : qui ou quoi ? où ? quand ? comment ? et, éventuellement, pourquoi ?
 *
 * Trois d’entre elles se contrôlent automatiquement sur tout article de l’IA,
 * sans annotation, en comparant l’article au texte de sa source :
 *
 * - Qui ou quoi : le titre ou le chapô nomme un acteur (nom propre, sigle).
 * - Où : l’article cite un des lieux de la source ; si la source n’en cite
 *   aucun de connu, un lieu introduit par « à », « en », « au »… suffit.
 * - Quand : l’article situe les faits dans le temps (jour, date, mois,
 *   année, heure) dès que la source le fait.
 *
 * « Comment » et « Pourquoi » demandent de comprendre le texte : ils ne sont
 * jugés que sur le jeu de référence, à partir de l’annotation.
 *
 * Fonctions pures et déterministes, sans appel à un modèle d’IA.
 */

export type QuestionKey = "who" | "where" | "when" | "how" | "why";

export const QUESTIONS: ReadonlyArray<{ key: QuestionKey; label: string; optional: boolean }> = [
  { key: "who", label: "Qui ou quoi ?", optional: false },
  { key: "where", label: "Où ?", optional: false },
  { key: "when", label: "Quand ?", optional: false },
  { key: "how", label: "Comment ?", optional: false },
  { key: "why", label: "Pourquoi ?", optional: true },
];

export function questionLabel(key: QuestionKey): string {
  return QUESTIONS.find((question) => question.key === key)?.label ?? key;
}

/** Questions contrôlées sans annotation. */
export type AutomaticQuestionKey = "who" | "where" | "when";

export type QuestionAnswer = {
  key: AutomaticQuestionKey;
  /** « sans objet » quand la source elle-même ne répond pas. */
  status: "répond" | "manque" | "sans objet";
  detail: string;
};

type Text = { title: string; description: string; content: string };

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .toLowerCase()
    .replace(/[’']/gu, " ")
    .replace(/[^\p{L}\p{N}:]+/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

/** Lieux andorrans, sous leurs noms catalan, français et espagnol. */
const PLACES: ReadonlyArray<{ name: string; variants: readonly string[] }> = [
  { name: "Andorre-la-Vieille", variants: ["andorra la vella", "andorre la vieille", "andorra la vieja"] },
  { name: "Escaldes-Engordany", variants: ["escaldes", "engordany"] },
  { name: "Encamp", variants: ["encamp"] },
  { name: "Canillo", variants: ["canillo"] },
  { name: "Ordino", variants: ["ordino"] },
  { name: "La Massana", variants: ["massana"] },
  { name: "Sant Julià de Lòria", variants: ["sant julia", "saint julien de loria", "san julian de loria"] },
  { name: "Pas de la Casa", variants: ["pas de la casa"] },
  { name: "Soldeu", variants: ["soldeu"] },
  { name: "El Tarter", variants: ["el tarter"] },
  { name: "Arinsal", variants: ["arinsal"] },
  { name: "Santa Coloma", variants: ["santa coloma"] },
  { name: "Aixovall", variants: ["aixovall"] },
  { name: "Grau Roig", variants: ["grau roig"] },
  { name: "Arcalís", variants: ["arcalis"] },
  { name: "Sispony", variants: ["sispony"] },
  { name: "Erts", variants: ["erts"] },
  { name: "Meritxell", variants: ["meritxell"] },
  { name: "La Cortinada", variants: ["cortinada"] },
  { name: "Llorts", variants: ["llorts"] },
  { name: "Ransol", variants: ["ransol"] },
  { name: "Anyós", variants: ["anyos"] },
  { name: "Juberri", variants: ["juberri"] },
  { name: "La Margineda", variants: ["margineda"] },
  { name: "Grandvalira", variants: ["grandvalira"] },
  { name: "Vallnord", variants: ["vallnord"] },
  { name: "Urgell", variants: ["seu d urgell", "la seu", "urgell"] },
  { name: "Andorre", variants: ["andorra", "andorre", "principat", "principaute", "principado"] },
  // Voisins et pays les plus cités par les sources.
  { name: "Catalogne", variants: ["catalogne", "catalunya", "cataluna"] },
  { name: "Espagne", variants: ["espagne", "espanya", "espana"] },
  { name: "France", variants: ["france", "franca", "francia"] },
  { name: "Portugal", variants: ["portugal"] },
  { name: "Italie", variants: ["italie", "italia"] },
  { name: "Allemagne", variants: ["allemagne", "alemanya", "alemania"] },
  { name: "Belgique", variants: ["belgique", "belgica"] },
  { name: "Suisse", variants: ["suisse", "suissa", "suiza"] },
  { name: "Royaume-Uni", variants: ["royaume uni", "regne unit", "reino unido"] },
  { name: "Europe", variants: ["europe", "europa", "europeenne", "europeen", "europeu", "europea", "europeo"] },
  { name: "Saint-Marin", variants: ["saint marin", "sant mari", "san marino"] },
  { name: "Monaco", variants: ["monaco"] },
  { name: "Luxembourg", variants: ["luxembourg", "luxemburg", "luxemburgo"] },
  { name: "Liechtenstein", variants: ["liechtenstein"] },
  { name: "États-Unis", variants: ["etats unis", "estats units", "estados unidos"] },
  { name: "Japon", variants: ["japon", "japo"] },
  { name: "Chine", variants: ["chine", "xina", "china"] },
  { name: "Brésil", variants: ["bresil", "brasil"] },
  { name: "Colombie", variants: ["colombie", "colombia"] },
  { name: "Algérie", variants: ["algerie", "algeria", "argelia"] },
  { name: "Maroc", variants: ["maroc", "marroc", "marruecos"] },
  { name: "Ukraine", variants: ["ukraine", "ucraina", "ucrania"] },
  { name: "République centrafricaine", variants: ["centrafricaine", "centreafricana", "centroafricana"] },
  { name: "Paris", variants: ["paris"] },
  { name: "Madrid", variants: ["madrid"] },
  { name: "Barcelone", variants: ["barcelone", "barcelona"] },
  { name: "Toulouse", variants: ["toulouse", "tolosa"] },
  { name: "Perpignan", variants: ["perpignan", "perpinya", "perpinan"] },
  { name: "Lleida", variants: ["lleida", "lerida"] },
  { name: "Marseille", variants: ["marseille", "marsella"] },
  { name: "Palma", variants: ["palma"] },
  { name: "Bruxelles", variants: ["bruxelles", "brussel les", "bruselas"] },
  { name: "Strasbourg", variants: ["strasbourg", "estrasburg", "estrasburgo"] },
  { name: "La Haye", variants: ["la haye", "la haia", "la haya"] },
  { name: "Genève", variants: ["geneve", "ginebra"] },
];

function placesIn(text: string): string[] {
  const normalized = ` ${normalize(text)} `;
  return PLACES.filter(({ variants }) => variants.some((variant) => normalized.includes(` ${variant} `))).map(
    ({ name }) => name,
  );
}

const TIME_WORDS = [
  // français
  "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche",
  "janvier", "fevrier", "mars", "avril", "mai", "juin", "juillet", "aout", "septembre", "octobre",
  "novembre", "decembre", "aujourd hui", "hier", "demain", "ce matin", "ce soir", "cette semaine",
  "ce week end", "cette annee", "ce mois", "la semaine prochaine", "la semaine derniere",
  // catalan
  "dilluns", "dimarts", "dimecres", "dijous", "divendres", "dissabte", "diumenge",
  "gener", "febrer", "maig", "juny", "juliol", "agost", "setembre", "desembre",
  "avui", "ahir", "dema", "aquest mati", "aquesta setmana", "aquest cap de setmana", "aquest any",
  // espagnol
  "lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo",
  "enero", "febrero", "marzo", "mayo", "junio", "julio", "agosto", "septiembre", "noviembre",
  "diciembre", "hoy", "ayer", "esta semana", "este fin de semana", "este ano",
];

const TIME_PATTERN = new RegExp(
  [
    `(?:^| )(?:${TIME_WORDS.join("|")})(?= |$)`,
    "(?:^| )(?:19|20)\\d{2}(?= |$)", // année
    "(?:^| )\\d{1,2}(?::| h | h$| hores| horas| heures)", // heure
  ].join("|"),
  "u",
);

function hasTimeMarker(text: string): boolean {
  return TIME_PATTERN.test(normalize(text));
}

/** Mots outils qui prennent une capitale en tête de phrase sans être des noms. */
const CAPITALIZED_FUNCTION_WORDS = new Set(
  (
    "le la les l un une des du de d au aux à a en dans pour par sur avec sans sous après avant depuis " +
    "selon face lors entre vers ce cet cette ces son sa ses leur leurs il elle ils elles on nous vous " +
    "et ou mais donc or ni car qui que quoi dont où plus moins tout tous toute toutes chaque aucun " +
    "nouveau nouvelle nouveaux nouvelles premier première dernier dernière deux trois quatre cinq"
  ).split(" "),
);

function nameCandidate(word: string): string {
  return word
    .replace(/^(?:[dlnsjmtc]|qu)['’]/iu, "")
    .replace(/^[^\p{L}]+|[^\p{L}\p{N}]+$/gu, "");
}

/**
 * Noms propres du texte : mots à capitale hors tête de phrase, sigles, et
 * mots de tête de phrase que la source écrit aussi avec une capitale
 * (« Encamp lance… », « Concòrdia propose… »).
 */
function properNouns(text: string, source: string): string[] {
  const names: string[] = [];
  for (const sentence of text.split(/(?<=[.!?:«»"])\s+|\n+/u)) {
    const words = sentence.split(/[\s,;()«»"]+/u).filter(Boolean);
    words.forEach((word, index) => {
      const clean = nameCandidate(word);
      if (clean.length < 2 || !/^\p{Lu}/u.test(clean)) return;
      if (CAPITALIZED_FUNCTION_WORDS.has(clean.toLowerCase())) return;
      const acronym = /^\p{Lu}{2,}$/u.test(clean);
      if (acronym || index > 0 || sourceHasName(clean, source)) names.push(clean);
    });
  }
  return [...new Set(names)];
}

function sourceHasName(word: string, source: string): boolean {
  return new RegExp(`(?:^|[^\\p{L}])${word.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}(?:[^\\p{L}]|$)`, "u").test(source);
}

function firstParagraph(content: string): string {
  return content.split(/\n\s*\n/u).find((paragraph) => paragraph.trim()) ?? "";
}

function who(article: Text, source: string): QuestionAnswer {
  const lead = [article.title, article.description, firstParagraph(article.content)].join("\n");
  const found = properNouns(lead, source);

  return found.length > 0
    ? { key: "who", status: "répond", detail: found.slice(0, 4).join(", ") }
    : { key: "who", status: "manque", detail: "le début de l’article ne nomme ni personne ni organisme" };
}

function where(article: Text, source: string): QuestionAnswer {
  const text = [article.title, article.description, article.content].join("\n");
  const sourcePlaces = placesIn(source);
  const articlePlaces = placesIn(text);
  const shared = articlePlaces.filter((place) => sourcePlaces.includes(place));

  if (shared.length > 0) return { key: "where", status: "répond", detail: shared.slice(0, 3).join(", ") };
  if (sourcePlaces.length > 0) {
    return { key: "where", status: "manque", detail: `lieu de la source absent : ${sourcePlaces.slice(0, 3).join(", ")}` };
  }
  if (articlePlaces.length > 0) return { key: "where", status: "répond", detail: articlePlaces.slice(0, 3).join(", ") };
  return { key: "where", status: "sans objet", detail: "la source ne cite aucun lieu connu" };
}

function when(article: Text, source: string): QuestionAnswer {
  const text = [article.title, article.description, article.content].join("\n");
  if (hasTimeMarker(text)) return { key: "when", status: "répond", detail: "date ou moment indiqué" };
  if (hasTimeMarker(source)) return { key: "when", status: "manque", detail: "la source date les faits, pas l’article" };
  return { key: "when", status: "sans objet", detail: "la source ne date pas les faits" };
}

/** Qui ou quoi, où, quand : contrôle automatique d’un article contre sa source. */
export function answerAutomaticQuestions(article: Text, source: { title: string; content: string }): QuestionAnswer[] {
  const sourceText = [source.title, source.content].join("\n");
  return [who(article, sourceText), where(article, sourceText), when(article, sourceText)];
}
