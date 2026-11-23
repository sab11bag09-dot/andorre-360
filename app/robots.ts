import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/seo/siteUrl";

/**
 * robots.txt du site : les pages publiques sont ouvertes aux moteurs de
 * recherche ; l’administration, l’API et la connexion ne le sont pas.
 */
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/login"] },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
