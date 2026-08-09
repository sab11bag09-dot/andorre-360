import * as cheerio from "cheerio";

import { Source } from "@/lib/generated/prisma/client";
import { XMLParser } from "fast-xml-parser";

import {
  Collector,
  ObservationInput,
} from "./Collector";
import { FetchHtmlClient } from "../html/FetchHtmlClient";

type XmlValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | XmlObject
  | XmlValue[];

type XmlObject = {
  [key: string]: XmlValue;
};

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  removeNSPrefix: true,
  parseTagValue: false,
  trimValues: true,
});

function toArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function getText(value: XmlValue): string | null {
  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    const normalizedValue = String(value).trim();

    return normalizedValue || null;
  }

  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    const text = value["#text"];

    if (
      typeof text === "string" ||
      typeof text === "number"
    ) {
      const normalizedText = String(text).trim();

      return normalizedText || null;
    }
  }

  return null;
}

function parseDate(value: XmlValue): Date | null {
  const text = getText(value);

  if (!text) {
    return null;
  }

  const date = new Date(text);

  return Number.isNaN(date.getTime()) ? null : date;
}

function getAtomLink(value: XmlValue): string | null {
  for (const link of toArray(value)) {
    if (typeof link === "string") {
      return link.trim() || null;
    }

    if (
      link &&
      typeof link === "object" &&
      !Array.isArray(link)
    ) {
      const href = getText(link["@_href"]);
      const rel = getText(link["@_rel"]);

      if (href && (!rel || rel === "alternate")) {
        return href;
      }
    }
  }

  return null;
}

function normalizeUrl(
  value: string | null,
  sourceUrl: string,
): string | null {
  if (!value) {
    return null;
  }

  try {
    return new URL(value, sourceUrl).toString();
  } catch {
    return null;
  }
}

function parseRssItem(
  item: XmlObject,
  sourceUrl: string,
): ObservationInput | null {
  const title = getText(item.title);
  const url = normalizeUrl(
    getText(item.link) ?? getText(item.guid),
    sourceUrl,
  );

  if (!title || !url) {
    return null;
  }

  return {
    title,
    url,
    publishedAt: parseDate(
      item.pubDate ?? item.published ?? item.updated,
    ),
    content:
      getText(item.encoded) ??
      getText(item.description) ??
      getText(item.summary),
  };
}

function parseAtomEntry(
  entry: XmlObject,
  sourceUrl: string,
): ObservationInput | null {
  const title = getText(entry.title);
  const url = normalizeUrl(
    getAtomLink(entry.link) ?? getText(entry.id),
    sourceUrl,
  );

  if (!title || !url) {
    return null;
  }

  return {
    title,
    url,
    publishedAt: parseDate(
      entry.published ?? entry.updated,
    ),
    content:
      getText(entry.content) ??
      getText(entry.summary),
  };
}


const htmlClient = new FetchHtmlClient();

async function enrichBbcContent(
  observation: ObservationInput,
): Promise<ObservationInput> {
  const hostname = new URL(observation.url).hostname;

  if (!["www.bbc.com", "bbc.com", "www.bbc.co.uk", "bbc.co.uk"].includes(hostname)) {
    return observation;
  }

  try {
    const html = await htmlClient.get(observation.url);
    const $ = cheerio.load(html);
    const selectors = [
      "article",
      "main",
      '[data-component="text-block"]',
      '[class*="article-body"]',
      "body",
    ];

    for (const selector of selectors) {
      const element = $(selector).first().clone();

      if (!element.length) continue;

      element.find("script, style, nav, header, footer, aside, form, figure").remove();

      const paragraphs = element
        .find("p")
        .map((_, paragraph) => $(paragraph).text().replace(/\\s+/g, " ").trim())
        .get()
        .filter(Boolean);

      const content = paragraphs.join("\\n\\n").trim();

      if (content.length >= 280) {
        return { ...observation, content };
      }
    }
  } catch (error) {
    console.error("[RssCollector] Impossible de récupérer l’article BBC", {
      url: observation.url,
      error,
    });
  }

  return observation;
}

export class RssCollector implements Collector {
  async collect(
    source: Source,
  ): Promise<ObservationInput[]> {
    const response = await fetch(source.url, {
      headers: {
        accept:
          "application/rss+xml, application/atom+xml, application/xml, text/xml",
        "user-agent": "ANDORRE-360/1.0",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        `Le flux a répondu avec le statut HTTP ${response.status}.`,
      );
    }

    const xml = await response.text();
    const document = parser.parse(xml) as XmlObject;

    const rssChannel = document.rss;

    if (
      rssChannel &&
      typeof rssChannel === "object" &&
      !Array.isArray(rssChannel)
    ) {
      const channel = rssChannel.channel;

      if (
        channel &&
        typeof channel === "object" &&
        !Array.isArray(channel)
      ) {
        const observations = toArray(channel.item)
          .filter(
            (item): item is XmlObject =>
              Boolean(
                item &&
                  typeof item === "object" &&
                  !Array.isArray(item),
              ),
          )
          .map((item) => parseRssItem(item, source.url))
          .filter(
            (
              observation,
            ): observation is ObservationInput =>
              observation !== null,
          );

        return Promise.all(observations.map(enrichBbcContent));
      }
    }

    const atomFeed = document.feed;

    if (
      atomFeed &&
      typeof atomFeed === "object" &&
      !Array.isArray(atomFeed)
    ) {
      return toArray(atomFeed.entry)
        .filter(
          (entry): entry is XmlObject =>
            Boolean(
              entry &&
                typeof entry === "object" &&
                !Array.isArray(entry),
            ),
        )
        .map((entry) =>
          parseAtomEntry(entry, source.url),
        )
        .filter(
          (
            observation,
          ): observation is ObservationInput =>
            observation !== null,
        );
    }

    throw new Error(
      "Le document reçu n’est pas un flux RSS ou Atom reconnu.",
    );
  }
}