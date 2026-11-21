import { describe, expect, it } from "vitest";

import { LOGIN_RATE_LIMIT, LoginRateLimiter, loginAttemptKeys } from "./loginRateLimit";

function clock(start = 0) {
  let now = start;
  return { now: () => now, advance: (ms: number) => (now += ms) };
}

describe("limite des tentatives de connexion", () => {
  const email = ["email:redaction@example.com"];

  it("bloque après 5 échecs pour une même adresse e-mail", () => {
    const limiter = new LoginRateLimiter(clock().now);
    for (let i = 0; i < LOGIN_RATE_LIMIT.maxFailuresPerEmail - 1; i += 1) limiter.recordFailure(email);
    expect(limiter.isBlocked(email)).toBe(false);

    limiter.recordFailure(email);
    expect(limiter.isBlocked(email)).toBe(true);
  });

  it("débloque à la fin de la fenêtre de 15 minutes", () => {
    const time = clock();
    const limiter = new LoginRateLimiter(time.now);
    for (let i = 0; i < 5; i += 1) limiter.recordFailure(email);

    time.advance(LOGIN_RATE_LIMIT.windowMs - 1);
    expect(limiter.isBlocked(email)).toBe(true);
    time.advance(1);
    expect(limiter.isBlocked(email)).toBe(false);
  });

  it("bloque une adresse IP après 20 échecs, même sur des e-mails différents", () => {
    const limiter = new LoginRateLimiter(clock().now);
    for (let i = 0; i < 19; i += 1) limiter.recordFailure([`email:${i}@example.com`, "ip:203.0.113.7"]);
    expect(limiter.isBlocked(["email:autre@example.com", "ip:203.0.113.7"])).toBe(false);

    limiter.recordFailure(["email:19@example.com", "ip:203.0.113.7"]);
    expect(limiter.isBlocked(["email:autre@example.com", "ip:203.0.113.7"])).toBe(true);
    expect(limiter.isBlocked(["email:autre@example.com", "ip:198.51.100.1"])).toBe(false);
  });

  it("efface les échecs de l’e-mail après une connexion réussie", () => {
    const limiter = new LoginRateLimiter(clock().now);
    for (let i = 0; i < 4; i += 1) limiter.recordFailure(email);
    limiter.reset(email);
    limiter.recordFailure(email);
    expect(limiter.isBlocked(email)).toBe(false);
  });

  it("compte par e-mail normalisé et par première adresse IP transmise", () => {
    const request = new Request("http://localhost/api/auth", {
      headers: { "x-forwarded-for": "203.0.113.7, 10.0.0.1" },
    });
    expect(loginAttemptKeys(" Redaction@Example.com ", request)).toEqual([
      "email:redaction@example.com",
      "ip:203.0.113.7",
    ]);
    expect(loginAttemptKeys("a@b.c")).toEqual(["email:a@b.c"]);
  });
});
