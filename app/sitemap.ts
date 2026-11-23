import type { MetadataRoute } from "next";

import { loadSitemap } from "@/lib/seo/sitemap";

// Les articles publiés changent à tout moment : le plan est calculé à chaque demande.
export const dynamic = "force-dynamic";

export default function sitemap(): Promise<MetadataRoute.Sitemap> {
  return loadSitemap();
}
