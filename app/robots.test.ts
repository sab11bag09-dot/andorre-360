import { afterEach, describe, expect, it, vi } from "vitest";

import robots from "./robots";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("robots.txt du site", () => {
  it("ouvre les pages publiques, ferme l’administration et annonce le plan du site", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://andorre360.ad");
    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/login"] },
      sitemap: "https://andorre360.ad/sitemap.xml",
    });
  });
});
