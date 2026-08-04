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

export class AndorraBusinessCollector implements Collector {
  constructor(
    private readonly htmlClient: HtmlClient =
      new FetchHtmlClient(),
  ) {}

  async collect(
    source: Source,
  ): Promise<ObservationInput[]> {
    const listingHtml = await this.htmlClient.get(source.url);
    const $ = cheerio.load(listingHtml);
    const links = $(".blog-shortcode-post-title a")
      .map((_, link) => ({
        title: normalizeText($(link).text()),
        url: new URL($(link).attr("href") ?? "", source.url)
          .toString(),
      }))
      .get()
      .filter((link) => link.title && link.url)
      .slice(0, 24);

    return Promise.all(
      links.map(async (link): Promise<ObservationInput> => {
        const articleHtml = await this.htmlClient.get(link.url);
        const article = cheerio.load(articleHtml);
        const content = article(".post-content .fusion-text-1")
          .first()
          .find("p")
          .map((_, paragraph) =>
            normalizeText(article(paragraph).text()),
          )
          .get()
          .filter(Boolean)
          .join("\n\n");
        const dateText = article(".updated")
          .first()
          .text()
          .trim();
        const publishedAt = dateText
          ? new Date(dateText)
          : null;

        return {
          title: link.title,
          url: link.url,
          publishedAt:
            publishedAt &&
            !Number.isNaN(publishedAt.getTime())
              ? publishedAt
              : null,
          content: content.length >= 50 ? content : null,
        };
      }),
    );
  }
}
