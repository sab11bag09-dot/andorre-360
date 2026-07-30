import * as cheerio from "cheerio";

import type { Source } from "@/lib/generated/prisma/client";

import type {
  Collector,
  ObservationInput,
} from "./Collector";
import { FetchHtmlClient } from "../html/FetchHtmlClient";
import type { HtmlClient } from "../html/HtmlClient";
import { siteRules } from "./siteRules";

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
    return new URL(value, sourceUrl).toString();
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

function parseGenericDate(value: string): Date | null {
  const catalanDate = parseCatalanDate(value);

  if (catalanDate) {
    return catalanDate;
  }

  const parsedDate = new Date(value);

  return Number.isNaN(parsedDate.getTime())
    ? null
    : parsedDate;
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


      let content: string | null = null;

      for (const selector of contentSelectors) {
        const element = $(selector).first().clone();

if (!element.length) {
  continue;
}

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

element
  .find(removeSelectors.join(", "))
  .remove();

        const paragraphs = element
  .find("p")
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
      !loweredText.includes("escolta l'article") &&
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

      const dateText =
        $("time").first().attr("datetime") ??
        $(
          "time, .date, .field--name-created, .published-date",
        )
          .first()
          .text();
console.log("[HtmlCollector] article extrait", {
  url,
  selectorUtilise: content ? "trouvé" : "aucun",
  contentLength: content?.length ?? 0,
  contentPreview: content?.slice(0, 300) ?? null,
});
      return {
        content,
        publishedAt: dateText
          ? parseGenericDate(dateText)
          : null,
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

    const links: Array<{
      title: string;
      url: string;
      publishedAt: Date | null;
    }> = [];

    const knownUrls = new Set<string>();

    $("h2 a").each((_, element) => {
      const link = $(element);
      const title = normalizeText(link.text());
      const href = link.attr("href");

      if (!title || !href) {
        return;
      }

      const url = normalizeUrl(href, source.url);

      if (!url || knownUrls.has(url)) {
        return;
      }

      const container = link.closest(
        "article, .views-row, .node, .item, li, div",
      );

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

    const observations: ObservationInput[] = [];

    for (const link of links) {
      const article =
        await this.getArticleContent(link.url);

      observations.push({
        title: link.title,
        url: link.url,
        publishedAt:
          article.publishedAt ??
          link.publishedAt,
        content: article.content,
      });
    }

    console.info(
      `[HtmlCollector] ${observations.length} observation(s) trouvée(s).`,
    );

    return observations;
  }
}