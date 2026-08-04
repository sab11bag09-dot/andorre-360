import {
  Source,
  SourceCollectionMode,
} from "@/lib/generated/prisma/client";

import { FcAndorraCollector } from "../collectors/FcAndorraCollector";
import { Collector } from "../collectors/Collector";
import { HtmlCollector } from "../collectors/HtmlCollector";
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
          url.hostname === "www.fcandorra.com" &&
          url.pathname === "/es/noticias"
        ) {
          return new FcAndorraCollector();
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