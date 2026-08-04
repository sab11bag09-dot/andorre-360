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

function createContentFingerprint(value: string): string {
  let hash = 2_166_136_261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }

  return (hash >>> 0).toString(36);
}

function createIncidentUrl(
  sourceUrl: string,
  title: string,
  content: string,
): string {
  const slug = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
  const fingerprint = createContentFingerprint(
    `${title}\n${content}`,
  );

  const url = new URL(sourceUrl);
  url.hash = "";
  url.searchParams.set(
    "incident",
    `${slug || "sans-titre"}-${fingerprint}`,
  );

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
        url: createIncidentUrl(
          source.url,
          title,
          content,
        ),
        publishedAt: null,
        content: content.length >= 20 ? content : null,
      });
    });

    return observations;
  }
}
