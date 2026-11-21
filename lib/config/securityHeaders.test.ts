import { describe, expect, it } from "vitest";

import nextConfig from "../../next.config";
import { CONTENT_SECURITY_POLICY, securityHeaders } from "./securityHeaders";

describe("en-têtes de sécurité", () => {
  it("interdit l’intégration dans un cadre étranger, les plugins et les formulaires vers un autre site", () => {
    expect(CONTENT_SECURITY_POLICY).toBe(
      "base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self'",
    );
  });

  it("n’impose HTTPS qu’en production", () => {
    const keys = (production: boolean) => securityHeaders(production).map(({ key }) => key);
    expect(keys(true)).toContain("Strict-Transport-Security");
    expect(keys(false)).not.toContain("Strict-Transport-Security");
    expect(keys(false)).toEqual(
      expect.arrayContaining(["X-Frame-Options", "X-Content-Type-Options", "Referrer-Policy", "Permissions-Policy"]),
    );
  });

  it("s’applique à toutes les pages et masque X-Powered-By", async () => {
    expect(nextConfig.poweredByHeader).toBe(false);
    const rules = await nextConfig.headers!();
    expect(rules).toEqual([{ source: "/:path*", headers: securityHeaders() }]);
  });
});
