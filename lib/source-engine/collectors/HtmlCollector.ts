import { Source } from "@/lib/generated/prisma/client";

import {
  Collector,
  ObservationInput,
} from "./Collector";
import { FetchHtmlClient } from "../html/FetchHtmlClient";
import { HtmlClient } from "../html/HtmlClient";

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

    await this.htmlClient.get(source.url);

    return [];
  }
}