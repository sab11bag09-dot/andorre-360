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

function createIncidentUrl(
  sourceUrl: string,
  title: string,
): string {
  const slug = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);

  const url = new URL(sourceUrl);
  url.hash = "";
  url.searchParams.set("incident", slug || "sans-titre");

  return url.toString();
}

export class MobilitatCollector implements Collector {
  constructor(
    private readonly htmlClient: HtmlClient =
      new FetchHtmlClient(),
  ) {}

  async collect(
    source: Source,
  ): Promise<ObservationInput[]> {
    const html = await this.htmlClient.get(source.url);
    const $ = cheerio.load(html);
    const observations: ObservationInput[] = [];
    let collectingAndorranIncidents = false;

    $("h3").each((_, heading) => {
      const title = normalizeText($(heading).text());
      const normalizedTitle = title.toLowerCase();

      if (
        normalizedTitle.includes(
          "incidències a les carreteres andorranes",
        )
      ) {
        collectingAndorranIncidents = true;
        return;
      }

      if (
        normalizedTitle.includes(
          "incidències a les carreteres catalanes",
        )
      ) {
        collectingAndorranIncidents = false;
        return false;
      }

      if (!collectingAndorranIncidents || !title) {
        return;
      }

      const content = normalizeText(
        $(heading).nextUntil("h3").text(),
      );

      observations.push({
        title,
        url: createIncidentUrl(source.url, title),
        publishedAt: null,
        content: content.length >= 20 ? content : null,
      });
    });

    return observations;
  }
}
