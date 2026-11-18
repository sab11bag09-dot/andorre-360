import * as cheerio from "cheerio";

import type { Source } from "@/lib/generated/prisma/client";

import type {
  Collector,
  ObservationInput,
} from "./Collector";
import { siteRules } from "./siteRules";
import { normalizeObservationPublishedAt } from "../observationDate";
import { FetchHtmlClient } from "../html/FetchHtmlClient";
import type { HtmlClient } from "../html/HtmlClient";

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeContent(value: string): string {
  return value
    .split(/\n+/)
    .map((line) => normalizeText(line))
    .filter(Boolean)
    .join("\n\n");
}

function normalizeUrl(
  value: string,
  sourceUrl: string,
): string | null {
  try {
    const url = new URL(value, sourceUrl);
    url.hash = "";

    return url.toString();
  } catch {
    return null;
  }
}

function parseCatalanDate(value: string): Date | null {
  const normalized = normalizeText(value)
    .toLowerCase()
    .replace(/\./g, "");

  const match = normalized.match(
    /(\d{1,2})\s*-\s*([a-zà-ÿ]+)\s*-\s*(\d{4})/,
  );

  if (!match) {
    return null;
  }

  const [, dayValue, monthValue, yearValue] = match;

  const months: Record<string, number> = {
    gen: 0,
    febr: 1,
    març: 2,
    abr: 3,
    maig: 4,
    juny: 5,
    jul: 6,
    ag: 7,
    set: 8,
    oct: 9,
    nov: 10,
    des: 11,
  };

  const month = months[monthValue];

  if (month === undefined) {
    return null;
  }

  const date = new Date(
    Number(yearValue),
    month,
    Number(dayValue),
  );

  return Number.isNaN(date.getTime())
    ? null
    : date;
}

function parseDayFirstNumericDate(
  value: string,
): Date | null {
  const match = normalizeText(value).match(
    /(?:^|\D)(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\D|$)/,
  );

  if (!match) {
    return null;
  }

  const [, dayValue, monthValue, yearValue] = match;
  const day = Number(dayValue);
  const month = Number(monthValue);
  const year = Number(yearValue);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

const LONG_MONTHS: Record<string, number> = {
  // Catalan
  gener: 0, febrer: 1, març: 2, abril: 3, maig: 4, juny: 5,
  juliol: 6, agost: 7, setembre: 8, octubre: 9, novembre: 10, desembre: 11,
  // Français
  janvier: 0, février: 1, mars: 2, avril: 3, mai: 4, juin: 5,
  juillet: 6, août: 7, septembre: 8, octobre: 9, décembre: 11,
  // Español
  enero: 0, febrero: 1, marzo: 2, mayo: 4, junio: 5, julio: 6,
  agosto: 7, septiembre: 8, noviembre: 10, diciembre: 11,
};

/** « 16 de novembre 2026 », « 17 novembre 2026 », « 3 d’agost de 2026 »… */
function parseLongWrittenDate(value: string): Date | null {
  const match = normalizeText(value)
    .toLowerCase()
    .match(
      /(?:^|[^\d])(\d{1,2})\s+(?:de\s+|d['’]\s*)?([a-zà-ÿç]+)\s+(?:de\s+)?(\d{4})(?:\D|$)/,
    );

  if (!match) {
    return null;
  }

  const [, dayValue, monthValue, yearValue] = match;
  const month = LONG_MONTHS[monthValue];

  if (month === undefined) {
    return null;
  }

  return validUtcDate(Number(yearValue), month, Number(dayValue));
}

function validUtcDate(year: number, month: number, day: number): Date | null {
  const date = new Date(Date.UTC(year, month, day));

  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month &&
    date.getUTCDate() === day
    ? date
    : null;
}

/** Date année/mois/jour présente dans le chemin de l’adresse, en dernier recours. */
function parseDateFromUrl(value: string): Date | null {
  try {
    const match = new URL(value).pathname.match(
      /\/(20\d{2})\/(\d{1,2})\/(\d{1,2})(?:\/|$)/,
    );

    if (!match) {
      return null;
    }

    const [, year, month, day] = match;

    return normalizeObservationPublishedAt(
      validUtcDate(Number(year), Number(month) - 1, Number(day)),
    );
  } catch {
    return null;
  }
}

/**
 * Dates de publication déclarées par la page selon les conventions
 * standard (Open Graph, schema.org). Les dates de modification ne sont
 * jamais retenues.
 */
function declaredPublicationDates($: cheerio.CheerioAPI): string[] {
  const values: string[] = [];
  const push = (value: string | undefined) => {
    const trimmed = value?.trim();
    if (trimmed) values.push(trimmed);
  };

  push($('meta[property="article:published_time"]').first().attr("content"));
  push($('meta[name="article:published_time"]').first().attr("content"));
  push($('meta[itemprop="datePublished"]').first().attr("content"));
  push($("[itemprop=datePublished][datetime]").first().attr("datetime"));

  $('script[type="application/ld+json"]').each((_, script) => {
    const text = $(script).text();

    try {
      collectJsonLdDatePublished(JSON.parse(text), values, 0);
    } catch {
      // JSON-LD mal formé : seule la clé datePublished est recherchée.
      const match = text.match(/"datePublished"\s*:\s*"([^"]{4,64})"/);
      if (match) values.push(match[1]);
    }
  });

  return values;
}

function collectJsonLdDatePublished(
  node: unknown,
  values: string[],
  depth: number,
): void {
  if (depth > 5 || node === null || typeof node !== "object") {
    return;
  }

  if (Array.isArray(node)) {
    for (const item of node) collectJsonLdDatePublished(item, values, depth + 1);
    return;
  }

  const record = node as Record<string, unknown>;

  if (typeof record.datePublished === "string" && record.datePublished.trim()) {
    values.push(record.datePublished.trim());
  }

  if (record["@graph"]) {
    collectJsonLdDatePublished(record["@graph"], values, depth + 1);
  }
}

function firstValidDate(candidates: string[]): Date | null {
  for (const candidate of candidates) {
    const date = parseGenericDate(candidate);
    if (date) return date;
  }

  return null;
}

function parseGenericDate(value: string): Date | null {
  const parsedDate =
    parseCatalanDate(value) ??
    parseDayFirstNumericDate(value) ??
    parseLongWrittenDate(value) ??
    (() => {
      const genericDate = new Date(value);

      return Number.isNaN(genericDate.getTime())
        ? null
        : genericDate;
    })();

  return normalizeObservationPublishedAt(parsedDate);
}

async function mapWithConcurrency<T, R>(
  values: T[],
  concurrency: number,
  mapper: (value: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(values.length);
  let nextIndex = 0;

  async function runWorker(): Promise<void> {
    while (nextIndex < values.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(values[currentIndex]);
    }
  }

  const workerCount = Math.min(
    Math.max(1, concurrency),
    values.length,
  );

  await Promise.all(
    Array.from({ length: workerCount }, () => runWorker()),
  );

  return results;
}

export class HtmlCollector implements Collector {
  constructor(
    private readonly htmlClient: HtmlClient =
      new FetchHtmlClient(),
  ) {}

  private async getArticleContent(
    url: string,
  ): Promise<{
    content: string | null;
    publishedAt: Date | null;
  }> {
    try {
      const html = await this.htmlClient.get(url);
      const $ = cheerio.load(html);

      const hostname = new URL(url).hostname;
      const siteRule = siteRules[hostname];

      const genericContentSelectors = [
        ".field--name-body",
        ".article-content",
        ".article-body",
        ".entry-content",
        ".post-content",
        ".content-noticia",
        ".noticia-cos",
        ".node__content",
      ];

      const contentSelectors = [
        ...(siteRule?.content ?? []),
        ...genericContentSelectors,
      ];

      const genericRemoveSelectors = [
        "script",
        "style",
        "nav",
        "footer",
        "header",
        "aside",
        "form",
        "button",
        "audio",
        ".comments",
        ".comentaris",
        ".share",
        ".social",
        ".meta",
        ".metadata",
      ];

      const removeSelectors = [
        ...genericRemoveSelectors,
        ...(siteRule?.remove ?? []),
      ];

      let content: string | null = null;

      for (const selector of contentSelectors) {
        const element = $(selector).first().clone();

        if (!element.length) {
          continue;
        }

        element
          .find(removeSelectors.join(", "))
          .remove();

        const paragraphElements = element.is("p")
          ? element
          : element.find("p");

        const paragraphs = paragraphElements
          .map((_, paragraph) =>
            normalizeText($(paragraph).text()),
          )
          .get()
          .filter((text) => {
            if (!text) {
              return false;
            }

            const loweredText = text.toLowerCase();

            return (
              !loweredText.includes(
                "escolta l'article",
              ) &&
              !loweredText.includes("comentaris") &&
              !/^\d{2}\/\d{2}\/\d{4}/.test(text)
            );
          });

        const extractedContent =
          paragraphs.length > 0
            ? paragraphs.join("\n\n")
            : normalizeContent(element.text());

        if (extractedContent.length >= 50) {
          content = extractedContent;
          break;
        }
      }

      // Priorité aux dates déclarées par l’article : une balise time de
      // la page peut afficher la date du jour (en-tête, agenda…).
      const publishedAt = firstValidDate([
        ...declaredPublicationDates($),
        $("time").first().attr("datetime") ?? "",
        $(
          "time, .date, .field--name-created, .published-date",
        )
          .first()
          .text(),
      ]);

      return {
        content,
        publishedAt,
      };
    } catch (error) {
      console.error(
        `[HtmlCollector] Impossible de lire ${url}`,
        error,
      );

      return {
        content: null,
        publishedAt: null,
      };
    }
  }

  async collect(
    source: Source,
  ): Promise<ObservationInput[]> {
    console.info(
      `[HtmlCollector] Collecte de ${source.url}`,
    );

    const html = await this.htmlClient.get(source.url);
    const $ = cheerio.load(html);

    const hostname = new URL(source.url).hostname;
    const siteRule = siteRules[hostname];

    const listingSelectors =
      siteRule?.listing ?? ["h2 a"];

    const links: Array<{
      title: string;
      url: string;
      publishedAt: Date | null;
    }> = [];

    const knownUrls = new Set<string>();

    for (const selector of listingSelectors) {
      $(selector).each((_, element) => {
        const link = $(element);
        const container = link.closest(
          "article, .views-row, .node, .item, li, div",
        );
        const titleContainer = container.closest(".item-noticia").length
          ? container.closest(".item-noticia")
          : container;

        const title = normalizeText(
          siteRule?.title
            ?.map((selector) => titleContainer.find(selector).first().text())
            .find((value) => normalizeText(value)) ?? link.text(),
        );

        const href = link.attr("href");

        if (!title || !href) {
          return;
        }

        const url = normalizeUrl(href, source.url);

        if (!url || knownUrls.has(url)) {
          return;
        }

        const articleUrl = new URL(url);

        if (
          siteRule?.articlePathPattern &&
          !siteRule.articlePathPattern.test(articleUrl.pathname)
        ) {
          return;
        }

        const dateText =
          container
            .find("time")
            .first()
            .attr("datetime") ??
          container
            .find(
              "time, .date, .field--name-created",
            )
            .first()
            .text();

        knownUrls.add(url);

        links.push({
          title,
          url,
          publishedAt: dateText
            ? parseGenericDate(dateText)
            : null,
        });
      });
    }

    const selectedLinks = siteRule?.maxArticles
      ? links.slice(0, siteRule.maxArticles)
      : links;
    const collectedObservations = await mapWithConcurrency(
      selectedLinks,
      siteRule?.concurrency ?? 1,
      async (link): Promise<ObservationInput> => {
        const article = await this.getArticleContent(link.url);

        return {
          title: link.title,
          url: link.url,
          publishedAt:
            article.publishedAt ??
            link.publishedAt ??
            parseDateFromUrl(link.url),
          content: article.content,
        };
      },
    );
    const observations = siteRule?.requireContent
      ? collectedObservations.filter(
          (observation) => observation.content !== null,
        )
      : collectedObservations;

    console.info(
      `[HtmlCollector] ${observations.length} observation(s) trouvée(s).`,
    );

    return observations;
  }
}
