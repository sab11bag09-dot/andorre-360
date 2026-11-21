/**
 * En-têtes de sécurité envoyés avec chaque réponse (voir `next.config.ts`).
 *
 * La politique de contenu (CSP) se limite volontairement à ce qui ne peut
 * casser aucune page : pas d’intégration du site dans un cadre étranger, pas
 * de plugin, pas de `<base>` ni d’envoi de formulaire vers un autre site.
 * Les scripts et les images ne sont pas encore restreints : il faudrait des
 * nonces sur chaque page rendue, et la liste des vidéos intégrées (YouTube,
 * Vimeo, TikTok, Facebook).
 */
export const CONTENT_SECURITY_POLICY = [
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
].join("; ");

export function securityHeaders(
  production = process.env.NODE_ENV === "production",
): { key: string; value: string }[] {
  return [
    { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
    { key: "X-Frame-Options", value: "SAMEORIGIN" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
    },
    // HTTPS obligatoire pendant deux ans ; ignoré par le navigateur en HTTP.
    ...(production
      ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]
      : []),
  ];
}
