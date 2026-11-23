import { parseRobotsTxt, robotsAllows, robotsRefusesAiInput, type RobotsTxt } from "./robotsTxt";

/**
 * Respect automatique des refus des sites (étape 2 de la feuille de route) :
 * avant chaque téléchargement, la collecte lit le `robots.txt` du site.
 *
 * - Fichier absent (réponse 4xx) : tout est permis.
 * - Site injoignable (erreur réseau ou réponse 5xx) : tout est interdit
 *   jusqu’au prochain essai, comme le prévoit la RFC 9309.
 * - Un fichier est gardé en mémoire 24 heures, une erreur 1 heure.
 */

const ROBOTS_TIMEOUT_MS = 10_000;
const MAX_ROBOTS_BYTES = 500 * 1024;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const ERROR_CACHE_TTL_MS = 60 * 60 * 1000;

export class RobotsRefusalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RobotsRefusalError";
  }
}

type Entry =
  | { kind: "rules"; robots: RobotsTxt; expiresAt: number }
  | { kind: "unreachable"; reason: string; expiresAt: number };

export type RobotsFetch = (url: string, init: RequestInit) => Promise<Response>;

export type RobotsPolicyOptions = {
  fetch?: RobotsFetch;
  now?: () => number;
};

export class RobotsPolicy {
  private readonly cache = new Map<string, Promise<Entry>>();
  private readonly fetchRobots: RobotsFetch;
  private readonly now: () => number;

  constructor(options: RobotsPolicyOptions = {}) {
    this.fetchRobots = options.fetch ?? ((url, init) => fetch(url, init));
    this.now = options.now ?? Date.now;
  }

  private async load(origin: string): Promise<Entry> {
    const now = this.now();
    try {
      const response = await this.fetchRobots(`${origin}/robots.txt`, {
        redirect: "follow",
        cache: "no-store",
        signal: AbortSignal.timeout(ROBOTS_TIMEOUT_MS),
        headers: { "User-Agent": "ANDORRE-360-Source-Engine/1.0", Accept: "text/plain,*/*;q=0.5" },
      });

      if (response.status >= 500 || response.status === 429) {
        return { kind: "unreachable", reason: `réponse ${response.status}`, expiresAt: now + ERROR_CACHE_TTL_MS };
      }
      if (!response.ok) {
        return { kind: "rules", robots: { groups: [] }, expiresAt: now + CACHE_TTL_MS };
      }

      const text = (await response.text()).slice(0, MAX_ROBOTS_BYTES);
      return { kind: "rules", robots: parseRobotsTxt(text), expiresAt: now + CACHE_TTL_MS };
    } catch (error) {
      const reason = error instanceof Error ? error.message : "erreur inconnue";
      return { kind: "unreachable", reason, expiresAt: now + ERROR_CACHE_TTL_MS };
    }
  }

  private async entry(url: URL): Promise<Entry> {
    const origin = url.origin;
    const cached = this.cache.get(origin);
    if (cached) {
      const entry = await cached;
      if (entry.expiresAt > this.now()) return entry;
    }

    const loading = this.load(origin);
    this.cache.set(origin, loading);
    return loading;
  }

  /** Refuse le téléchargement d’une adresse que le `robots.txt` du site interdit. */
  async assertAllowed(value: string | URL): Promise<void> {
    const url = new URL(value);
    const entry = await this.entry(url);

    if (entry.kind === "unreachable") {
      throw new RobotsRefusalError(
        `robots.txt de ${url.hostname} injoignable (${entry.reason}) : collecte suspendue par prudence.`,
      );
    }
    if (!robotsAllows(entry.robots, `${url.pathname}${url.search}`)) {
      throw new RobotsRefusalError(`robots.txt de ${url.hostname} interdit la collecte de ${url.pathname}.`);
    }
  }

  /** Refuse une source dont le site interdit l’usage de ses contenus par l’IA. */
  async assertAiInputAllowed(value: string | URL): Promise<void> {
    const url = new URL(value);
    const entry = await this.entry(url);

    if (entry.kind === "unreachable") {
      throw new RobotsRefusalError(
        `robots.txt de ${url.hostname} injoignable (${entry.reason}) : usage par l’IA suspendu par prudence.`,
      );
    }
    if (robotsRefusesAiInput(entry.robots)) {
      throw new RobotsRefusalError(
        `${url.hostname} refuse l’usage de ses contenus par l’IA (robots.txt : Content-Signal ai-input=no).`,
      );
    }
  }
}

/** Politique partagée par toute la collecte, avec son cache. */
export const robotsPolicy = new RobotsPolicy();
