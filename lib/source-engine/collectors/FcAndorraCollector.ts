import * as cheerio from "cheerio";
import type { Source } from "@/lib/generated/prisma/client";
import type { Collector, ObservationInput } from "./Collector";
import { FetchHtmlClient } from "../html/FetchHtmlClient";
import type { HtmlClient } from "../html/HtmlClient";

type NewsItem = { title?: string; excerpt?: string; slug?: string; publishedAt?: string };

export class FcAndorraCollector implements Collector {
  constructor(private readonly htmlClient: HtmlClient = new FetchHtmlClient()) {}

  async collect(source: Source): Promise<ObservationInput[]> {
    const html = await this.htmlClient.get(source.url);
    const $ = cheerio.load(html);
    const raw = $("#__NEXT_DATA__").text();
    if (!raw) return [];
    const page = JSON.parse(raw)?.props?.pageProps?.data?.page;
    const modules = page?.grids?.flatMap((grid: any) =>
      grid.areas?.flatMap((area: any) => area.modules ?? []) ?? [],
    ) ?? [];
    const news = modules.find((module: any) =>
      module.type === "list" && module.subtype === "news",
    );
    return ((news?.data ?? []) as NewsItem[])
      .filter((item) => item.title && item.slug)
      .slice(0, 24)
      .map((item) => ({
        title: item.title!.trim(),
        url: new URL(`/es/noticias/${item.slug}`, source.url).toString(),
        publishedAt: item.publishedAt ? new Date(item.publishedAt) : null,
        content: item.excerpt?.trim() || item.title!.trim(),
      }));
  }
}
