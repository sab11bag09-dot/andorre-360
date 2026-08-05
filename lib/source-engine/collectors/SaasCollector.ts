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

function parseDate(value: string): Date | null {
  const match = value.match(
    /(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{4})/,
  );

  if (!match) {
    return null;
  }

  const [, day, month, year] = match;
  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
  );

  return Number.isNaN(date.getTime()) ? null : date;
}

export class SaasCollector implements Collector {
  constructor(
    private readonly htmlClient: HtmlClient =
      new FetchHtmlClient(),
  ) {}

  async collect(
    source: Source,
  ): Promise<ObservationInput[]> {
    const listingHtml = await this.htmlClient.get(source.url);
    const $ = cheerio.load(listingHtml);
    const links = $(".item-actualitat")
      .map((_, card) => {
        const element = $(card);
        const title = normalizeText(element.find("h2, h3").first().text());
        const href =
          element.find("a.stretched-link").attr("href") ??
          element.find("a[href]").first().attr("href");

        return href && title
          ? {
              title,
              url: new URL(href, source.url).toString(),
            }
          : null;
      })
      .get()
      .filter(
        (
          link,
        ): link is { title: string; url: string } =>
          link !== null,
      )
      .slice(0, 24);

    return Promise.all(
      links.map(async (link): Promise<ObservationInput> => {
        const articleHtml = await this.htmlClient.get(link.url);
        const article = cheerio.load(articleHtml);
        const body = article(
          "noticiesdetail .text-detall .col-12 > div, .text-detall, main, article",
        ).first();
        const content = body
          .find("p")
          .map((_, paragraph) =>
            normalizeText(article(paragraph).text()),
          )
                    .get()
          .filter(Boolean)
          .filter(
            (text) =>
              !/^\d{1,2}\s*\/\s*\d{1,2}\s*\/\s*\d{4}$/.test(text),
          )
          .join("\n\n");

        return {
          title: link.title,
          url: link.url,
          publishedAt: parseDate(
            article(".data-noti").first().text(),
          ),
          content: content.length >= 50 ? content : null,
        };
      }),
    );
  }
}
