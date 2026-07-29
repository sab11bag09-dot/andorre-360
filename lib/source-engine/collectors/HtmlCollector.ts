import * as cheerio from "cheerio";

import type { Source } from "@/lib/generated/prisma/client";

import type {
  Collector,
  ObservationInput,
} from "./Collector";
import { FetchHtmlClient } from "../html/FetchHtmlClient";
import type { HtmlClient } from "../html/HtmlClient";

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
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

  return Number.isNaN(date.getTime()) ? null : date;
}

export class HtmlCollector implements Collector {
  constructor(
    private readonly htmlClient: HtmlClient =
      new FetchHtmlClient(),
  ) {}

  async collect(
    source: Source,
  ): Promise<ObservationInput[]> {
    console.info(
      `[HtmlCollector] Collecte de ${source.url}`,
    );

    const html = await this.htmlClient.get(source.url);
    const $ = cheerio.load(html);

    const observations: ObservationInput[] = [];
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

      const containerText = normalizeText(container.text());

      const dateText =
        container
          .find("time")
          .first()
          .attr("datetime") ??
        container
          .find("time, .date, .field--name-created")
          .first()
          .text() ??
        containerText;

      const description = normalizeText(
        container
          .find(
            "p, .field--name-body, .field--name-field-resum",
          )
          .first()
          .text(),
      );

      const publishedAt =
        parseCatalanDate(dateText) ??
        (() => {
          const parsed = new Date(dateText);

          return Number.isNaN(parsed.getTime())
            ? null
            : parsed;
        })();

      knownUrls.add(url);

      observations.push({
        title,
        url,
        publishedAt,
        content: description || null,
      });
    });

    console.info(
      `[HtmlCollector] ${observations.length} observation(s) trouvée(s).`,
    );

    return observations;
  }
}