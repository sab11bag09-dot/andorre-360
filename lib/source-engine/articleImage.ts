import type { CheerioAPI } from "cheerio";

/**
 * Image et mention de droits d’un article collecté.
 *
 * La collecte relève l’image que l’article déclare pour le partage
 * (Open Graph, Twitter, JSON-LD) et la mention de droits affichée par le
 * site. Elle ne décide pas de leur réutilisation : ce choix dépend de la
 * source et reste fermé par défaut.
 */

const MAX_RIGHTS_LENGTH = 160;

/** Images génériques du site, jamais propres à l’article. */
const GENERIC_IMAGE = /(^|[\/_.-])(logo|logotip|favicon|icon|icona|sprite)([\/_.-]|$)/i;
/** Image par défaut : seul le nom du fichier compte (« sites/default/files/ » range de vraies photos). */
const DEFAULT_FILENAME = /(^|[_.-])(default|placeholder|no-image|noimage)([_.-]|$)/i;
const NON_PHOTO_EXTENSION = /\.(svg|ico|gif)(\?|#|$)/i;

const RIGHTS_PATTERN =
  /(©|\(c\)\s|copyright|tots els drets reservats|todos los derechos reservados|tous droits réservés|all rights reserved)/i;

function publishableImageUrl(value: string | undefined | null, baseUrl: string): string | null {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  let url: URL;

  try {
    url = new URL(trimmed, baseUrl);
  } catch {
    return null;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return null;
  }

  const filename = url.pathname.split("/").pop() ?? "";

  if (
    GENERIC_IMAGE.test(url.pathname) ||
    DEFAULT_FILENAME.test(filename) ||
    NON_PHOTO_EXTENSION.test(url.pathname)
  ) {
    return null;
  }

  return url.toString();
}

function jsonLdImages(value: unknown): string[] {
  if (!value) {
    return [];
  }

  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap(jsonLdImages);
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;

    return [
      ...jsonLdImages(record.image),
      ...(typeof record.url === "string" && record["@type"] === "ImageObject" ? [record.url] : []),
      ...(typeof record.url === "string" && !("image" in record) && !("@type" in record) ? [record.url] : []),
      ...jsonLdImages(record["@graph"]),
    ];
  }

  return [];
}

function readJsonLd($: CheerioAPI): string[] {
  return $('script[type="application/ld+json"]')
    .map((_, element) => {
      try {
        return jsonLdImages(JSON.parse($(element).text()));
      } catch {
        return [];
      }
    })
    .get()
    .flat();
}

export function extractArticleImage($: CheerioAPI, pageUrl: string): string | null {
  const candidates = [
    $('meta[property="og:image:secure_url"]').attr("content"),
    $('meta[property="og:image"]').attr("content"),
    $('meta[name="og:image"]').attr("content"),
    $('meta[name="twitter:image"]').attr("content"),
    $('meta[property="twitter:image"]').attr("content"),
    ...readJsonLd($),
    $('link[rel="image_src"]').attr("href"),
  ];

  for (const candidate of candidates) {
    const url = publishableImageUrl(candidate, pageUrl);

    if (url) {
      return url;
    }
  }

  return null;
}

function shorten(text: string): string {
  const normalized = text.replace(/\s+/g, " ").trim();

  return normalized.length > MAX_RIGHTS_LENGTH
    ? `${normalized.slice(0, MAX_RIGHTS_LENGTH - 1).trimEnd()}…`
    : normalized;
}

export function extractRightsNotice($: CheerioAPI): string | null {
  const declared =
    $('meta[name="copyright"]').attr("content") ??
    $('meta[name="dcterms.rights"]').attr("content") ??
    $('meta[name="rights"]').attr("content");

  if (declared?.trim()) {
    return shorten(declared);
  }

  const containers = $("footer").length ? $("footer") : $("body");
  const lines = containers
    .find("p, span, div, small, li")
    .addBack()
    .map((_, element) => $(element).clone().children().remove().end().text())
    .get()
    .map((text) => text.replace(/\s+/g, " ").trim())
    .filter((text) => text && RIGHTS_PATTERN.test(text));

  return lines.length > 0 ? shorten(lines[0]) : null;
}

type XmlValue = Record<string, unknown>;

function xmlImageUrl(value: unknown, baseUrl: string): string | null {
  for (const item of Array.isArray(value) ? value : [value]) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const record = item as XmlValue;
    const type = String(record["@_type"] ?? "");
    const medium = String(record["@_medium"] ?? "");

    if ((type && !type.startsWith("image/")) || (medium && medium !== "image")) {
      continue;
    }

    const url = publishableImageUrl(String(record["@_url"] ?? ""), baseUrl);

    if (url) {
      return url;
    }
  }

  return null;
}

/** Image jointe à un élément RSS (`enclosure`, `media:content`, `media:thumbnail`). */
export function extractRssItemImage(item: XmlValue, feedUrl: string): string | null {
  return (
    xmlImageUrl(item.enclosure, feedUrl) ??
    xmlImageUrl(item.content, feedUrl) ??
    xmlImageUrl(item.thumbnail, feedUrl)
  );
}
