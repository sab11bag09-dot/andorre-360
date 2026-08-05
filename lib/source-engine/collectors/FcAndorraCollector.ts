/* eslint-disable @typescript-eslint/no-explicit-any */
import * as cheerio from "cheerio";
import type { Source } from "@/lib/generated/prisma/client";
import type { Collector, ObservationInput } from "./Collector";
import { FetchHtmlClient } from "../html/FetchHtmlClient";
import type { HtmlClient } from "../html/HtmlClient";

type NewsItem = {
  title?: string;
  excerpt?: string;
  slug?: string;
  publishedAt?: string;
};

function normalizeContent(value: string): string {
  return value
    .replace(/\s+/g, " ")
    .trim();
}

async function readArticleContent(
  client: HtmlClient,
  url: string,
): Promise<string | null> {
  try {
    const html = await client.get(url);
    const $ = cheerio.load(html);
    const paragraphs = $(
      ".MkContentBlocks__richText p, .MkRickText p, p.isSelectedEnd",
    )
      .map((_, element) => normalizeContent($(element).text()))
      .get()
      .filter(Boolean);

    const content = normalizeContent(paragraphs.join("\n\n"));
    return content || null;
  } catch (error) {
    console.error("[FcAndorraCollector] Impossible de lire l’article", {
      url,
      error,
    });
    return null;
  }
}

export class FcAndorraCollector implements Collector {
  constructor(
    private readonly htmlClient: HtmlClient = new FetchHtmlClient(),
  ) {}

  async collect(source: Source): Promise<ObservationInput[]> {
    const html = await this.htmlClient.get(source.url);
    const $ = cheerio.load(html);
    const raw = $("#__NEXT_DATA__").text();
    if (!raw) return [];

    const page = JSON.parse(raw)?.props?.pageProps?.data?.page;
    const modules =
      page?.grids?.flatMap((grid: any) =>
        grid.areas?.flatMap((area: any) => area.modules ?? []) ?? [],
      ) ?? [];
    const news = modules.find(
      (module: any) =>
        module.type === "list" && module.subtype === "news",
    );

    const items = ((news?.data ?? []) as NewsItem[])
      .filter((item) => item.title && item.slug)
      .slice(0, 24);

    return Promise.all(
      items.map(async (item) => {
        const url = new URL(
          `/es/noticias/${item.slug}`,
          source.url,
        ).toString();
        const articleContent = await readArticleContent(
          this.htmlClient,
          url,
        );

        return {
          title: item.title!.trim(),
          url,
          publishedAt: item.publishedAt
            ? new Date(item.publishedAt)
            : null,
          content:
            articleContent ??
            item.excerpt?.trim() ??
            item.title!.trim(),
        };
      }),
    );
  }
}
