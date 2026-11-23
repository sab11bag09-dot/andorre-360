/**
 * Adresse publique du site, pour les liens absolus (balises, plan du site,
 * robots.txt). Réglée en production par `NEXT_PUBLIC_SITE_URL`.
 */
export function siteUrl(env: Record<string, string | undefined> = process.env): URL {
  return new URL(env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000");
}

export function absoluteUrl(path: string, base: URL = siteUrl()): string {
  return new URL(path, base).toString();
}
