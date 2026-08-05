import * as cheerio from "cheerio";

import type { Source } from "@/lib/generated/prisma/client";

import type {
  Collector,
  ObservationInput,
} from "./Collector";
import { FetchHtmlClient } from "../html/FetchHtmlClient";
import type { HtmlClient } from "../html/HtmlClient";

const ALERT_IMAGE_PATTERN =
  /\/images\/alertes\/img\/(\d+)_(\d+)_(\d+)\.jpe?g$/i;

export class MeteoAlertsCollector implements Collector {
  constructor(
    private readonly htmlClient: HtmlClient =
      new FetchHtmlClient(),
    private readonly now: () => Date = () => new Date(),
  ) {}

  async collect(
    source: Source,
  ): Promise<ObservationInput[]> {
    const html = await this.htmlClient.get(source.url);
    const $ = cheerio.load(html);
    const imageSource = $("img")
      .map((_, image) => $(image).attr("src"))
      .get()
      .find((value): value is string =>
        ALERT_IMAGE_PATTERN.test(value ?? ""),
      );

    if (!imageSource) {
      throw new Error(
        "L’état des avis météorologiques est introuvable.",
      );
    }

    const match = imageSource.match(ALERT_IMAGE_PATTERN);

    if (!match) {
      return [];
    }

    const zoneStates = match.slice(1);

    if (zoneStates.every((state) => state === "1")) {
      return [];
    }

    const collectedAt = this.now();
    const collectionDate = collectedAt
      .toISOString()
      .slice(0, 10);
    const status = zoneStates.join("-");
    const url = new URL(source.url);
    url.hash = "";
    url.searchParams.set(
      "avis",
      `${collectionDate}-${status}`,
    );

    return [
      {
        title: "Avís meteorològic actiu a Andorra",
        url: url.toString(),
        publishedAt: collectedAt,
        content:
          `Estat oficial de les zones nord, centre i sud : ${status}. ` +
          `Mapa officiel : ${new URL(imageSource, source.url).toString()}`,
      },
    ];
  }
}
