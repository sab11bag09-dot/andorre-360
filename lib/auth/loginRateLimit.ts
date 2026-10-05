type Attempt = {
  failures: number;
  firstFailureAt: number;
  blockedUntil: number;
};

const WINDOW_MS = 15 * 60_000;
const BLOCK_MS = 15 * 60_000;
const MAX_FAILURES = 5;
const attempts = new Map<string, Attempt>();

function prune(now: number): void {
  for (const [key, attempt] of attempts) {
    if (
      attempt.blockedUntil <= now &&
      attempt.firstFailureAt + WINDOW_MS <= now
    ) {
      attempts.delete(key);
    }
  }
}

export function getClientAddress(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip")?.trim() ??
    "unknown"
  );
}

export function isLoginAllowed(key: string, now = Date.now()): boolean {
  prune(now);
  const attempt = attempts.get(key);

  return !attempt || attempt.blockedUntil <= now;
}

export function recordLoginFailure(
  key: string,
  now = Date.now(),
): { blocked: boolean; retryAfterSeconds: number } {
  prune(now);
  const current = attempts.get(key);
  const attempt =
    !current || current.firstFailureAt + WINDOW_MS <= now
      ? { failures: 0, firstFailureAt: now, blockedUntil: 0 }
      : current;

  attempt.failures += 1;
  if (attempt.failures >= MAX_FAILURES) {
    attempt.blockedUntil = now + BLOCK_MS;
  }

  attempts.set(key, attempt);

  return {
    blocked: attempt.blockedUntil > now,
    retryAfterSeconds: Math.max(
      0,
      Math.ceil((attempt.blockedUntil - now) / 1_000),
    ),
  };
}

export function clearLoginFailures(key: string): void {
  attempts.delete(key);
}
