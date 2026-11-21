/**
 * Limite des tentatives de connexion à l’administration.
 *
 * Après 5 échecs pour une même adresse e-mail, ou 20 depuis une même
 * adresse IP, en 15 minutes, toute nouvelle tentative est refusée sans même
 * vérifier le mot de passe, jusqu’à la fin de la fenêtre. Une connexion
 * réussie efface les échecs de l’adresse e-mail.
 *
 * Les compteurs sont gardés en mémoire : ils valent pour un seul serveur (le
 * site tourne sur une seule instance, avec sa base SQLite) et repartent de
 * zéro au redémarrage.
 */

export const LOGIN_RATE_LIMIT = {
  windowMs: 15 * 60 * 1000,
  maxFailuresPerEmail: 5,
  maxFailuresPerIp: 20,
} as const;

type Attempts = { failures: number; windowStartedAt: number };

export class LoginRateLimiter {
  private readonly attempts = new Map<string, Attempts>();

  constructor(
    private readonly now: () => number = () => Date.now(),
    private readonly limits = LOGIN_RATE_LIMIT,
  ) {}

  private current(key: string): Attempts | null {
    const entry = this.attempts.get(key);
    if (!entry) return null;
    if (this.now() - entry.windowStartedAt >= this.limits.windowMs) {
      this.attempts.delete(key);
      return null;
    }
    return entry;
  }

  private limitFor(key: string): number {
    return key.startsWith("ip:") ? this.limits.maxFailuresPerIp : this.limits.maxFailuresPerEmail;
  }

  /** Vrai si l’une des clés a atteint sa limite dans la fenêtre en cours. */
  isBlocked(keys: readonly string[]): boolean {
    return keys.some((key) => (this.current(key)?.failures ?? 0) >= this.limitFor(key));
  }

  recordFailure(keys: readonly string[]): void {
    for (const key of keys) {
      const entry = this.current(key);
      if (entry) entry.failures += 1;
      else this.attempts.set(key, { failures: 1, windowStartedAt: this.now() });
    }
    // Garde-fou mémoire : les fenêtres expirées sont purgées de temps en temps.
    if (this.attempts.size > 10_000) {
      for (const key of [...this.attempts.keys()]) this.current(key);
    }
  }

  reset(keys: readonly string[]): void {
    for (const key of keys) this.attempts.delete(key);
  }
}

/** Clés de comptage d’une tentative : l’adresse e-mail et, si connue, l’adresse IP. */
export function loginAttemptKeys(email: string, request?: Request): string[] {
  const keys = [`email:${email.trim().toLowerCase()}`];
  const forwarded = request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request?.headers.get("x-real-ip")?.trim();
  if (ip) keys.push(`ip:${ip}`);
  return keys;
}

const globalForLogin = globalThis as unknown as { loginRateLimiter?: LoginRateLimiter };

/** Limiteur partagé par le serveur (conservé entre deux rechargements en développement). */
export const loginRateLimiter = (globalForLogin.loginRateLimiter ??= new LoginRateLimiter());
