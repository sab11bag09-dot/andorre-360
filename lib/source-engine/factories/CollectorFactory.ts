import {
  Source,
  SourceCollectionMode,
} from "@/lib/generated/prisma/client";

import { Collector } from "../collectors/Collector";
import { HtmlCollector } from "../collectors/HtmlCollector";
import { MeteoAlertsCollector } from "../collectors/MeteoAlertsCollector";
import { RssCollector } from "../collectors/RssCollector";
import { CollectorFactoryInterface } from "./CollectorFactoryInterface";

export class CollectorFactory
  implements CollectorFactoryInterface
{
  create(source: Source): Collector {
    switch (source.collectionMode) {
      case SourceCollectionMode.RSS:
        return new RssCollector();

      case SourceCollectionMode.HTML: {
        const url = new URL(source.url);

        if (
          url.hostname === "www.meteo.ad" &&
          url.pathname.toLowerCase() === "/alertes"
        ) {
          return new MeteoAlertsCollector();
        }

        return new HtmlCollector();
      }

      default:
        throw new Error(
          `Aucun collecteur disponible pour le mode "${source.collectionMode}".`,
        );
    }
  }
}
