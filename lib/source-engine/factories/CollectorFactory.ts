import {
  Source,
  SourceCollectionMode,
} from "@/lib/generated/prisma/client";

import { Collector } from "../collectors/Collector";
import { HtmlCollector } from "../collectors/HtmlCollector";
import { MobilitatCollector } from "../collectors/MobilitatCollector";
import { RssCollector } from "../collectors/RssCollector";
import { CollectorFactoryInterface } from "./CollectorFactoryInterface";

export class CollectorFactory
  implements CollectorFactoryInterface
{
  create(source: Source): Collector {
    switch (source.collectionMode) {
      case SourceCollectionMode.RSS:
        return new RssCollector();

      case SourceCollectionMode.HTML:
        if (
          new URL(source.url).hostname ===
          "www.mobilitat.ad"
        ) {
          return new MobilitatCollector();
        }

        return new HtmlCollector();

      default:
        throw new Error(
          `Aucun collecteur disponible pour le mode "${source.collectionMode}".`,
        );
    }
  }
}
