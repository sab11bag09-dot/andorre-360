/**
 * Lecture d’un fichier `robots.txt` (RFC 9309) et de ses signaux d’usage par
 * l’IA (`Content-Signal`, proposé par Cloudflare en 2025).
 *
 * Fonctions pures et déterministes, sans réseau : voir `robotsPolicy.ts`
 * pour le téléchargement et le cache.
 */

/** Jeton par lequel la collecte d’ANDORRE 360 s’identifie auprès des sites. */
export const ROBOTS_PRODUCT_TOKEN = "andorre-360";

type Rule = { allow: boolean; path: string };

type Group = {
  agents: string[];
  rules: Rule[];
  /** `Content-Signal` du groupe : `search`, `ai-input`, `ai-train` → oui ou non. */
  signals: Record<string, boolean>;
};

export type RobotsTxt = { groups: Group[] };

function parseSignals(value: string, into: Record<string, boolean>): void {
  for (const part of value.split(",")) {
    const [name, setting] = part.split("=").map((piece) => piece.trim().toLowerCase());
    if (name && (setting === "yes" || setting === "no")) into[name] = setting === "yes";
  }
}

export function parseRobotsTxt(text: string): RobotsTxt {
  const groups: Group[] = [];
  let current: Group | null = null;
  let lastWasAgent = false;

  for (const rawLine of text.split(/\r?\n/u)) {
    const line = rawLine.replace(/#.*$/u, "").trim();
    const separator = line.indexOf(":");
    if (separator <= 0) continue;

    const field = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();

    if (field === "user-agent") {
      // Plusieurs lignes `User-agent` qui se suivent forment un seul groupe.
      if (!current || !lastWasAgent) {
        current = { agents: [], rules: [], signals: {} };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
      continue;
    }

    lastWasAgent = false;
    if (!current) continue;

    if (field === "allow" || field === "disallow") {
      // « Disallow: » vide n’interdit rien.
      if (value) current.rules.push({ allow: field === "allow", path: value });
    } else if (field === "content-signal") {
      parseSignals(value, current.signals);
    }
  }

  return { groups };
}

/** Groupe qui s’applique à la collecte : le nôtre s’il est nommé, sinon « * ». */
function groupFor(robots: RobotsTxt): Group | null {
  const named = robots.groups.filter((group) =>
    group.agents.some((agent) => agent !== "*" && ROBOTS_PRODUCT_TOKEN.startsWith(agent)),
  );
  if (named.length > 0) return mergeGroups(named);

  const wildcard = robots.groups.filter((group) => group.agents.includes("*"));
  return wildcard.length > 0 ? mergeGroups(wildcard) : null;
}

function mergeGroups(groups: Group[]): Group {
  return {
    agents: groups.flatMap((group) => group.agents),
    rules: groups.flatMap((group) => group.rules),
    signals: Object.assign({}, ...groups.map((group) => group.signals)),
  };
}

function patternToRegExp(path: string): RegExp {
  const anchored = path.endsWith("$");
  const body = (anchored ? path.slice(0, -1) : path)
    .split("*")
    .map((piece) => piece.replace(/[.+?^${}()|[\]\\]/gu, "\\$&"))
    .join(".*");
  return new RegExp(`^${body}${anchored ? "$" : ""}`, "u");
}

function decodePath(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * Le chemin (avec sa requête) peut-il être collecté ? La règle la plus longue
 * l’emporte ; à longueur égale, « Allow » l’emporte (RFC 9309).
 */
export function robotsAllows(robots: RobotsTxt, pathWithQuery: string): boolean {
  const group = groupFor(robots);
  if (!group) return true;

  const path = decodePath(pathWithQuery || "/");
  let best: Rule | null = null;

  for (const rule of group.rules) {
    if (!patternToRegExp(decodePath(rule.path)).test(path)) continue;
    if (
      !best ||
      rule.path.length > best.path.length ||
      (rule.path.length === best.path.length && rule.allow && !best.allow)
    ) {
      best = rule;
    }
  }

  return best ? best.allow : true;
}

/**
 * Le site refuse-t-il qu’on donne ses contenus à une IA pour produire un
 * texte (`Content-Signal: ai-input=no`) ? C’est l’usage d’ANDORRE 360 : la
 * source sert à rédiger l’article. `ai-train` (entraînement) ne nous concerne
 * pas : les appels à l’IA ne sont pas conservés pour l’entraîner.
 */
export function robotsRefusesAiInput(robots: RobotsTxt): boolean {
  return groupFor(robots)?.signals["ai-input"] === false;
}
