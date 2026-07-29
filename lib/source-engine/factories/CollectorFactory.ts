import {
  Source,
  SourceCollectionMode,
} from "@/lib/generated/prisma/client";

import { Collector } from "../collectors/Collector";
import { HtmlCollector } from "../collectors/HtmlCollector";
import { CollectorFactoryInterface } from "./CollectorFactoryInterface";

export class CollectorFactory
  implements CollectorFactoryInterface
{
  create(source: Source): Collector {
    switch (source.collectionMode) {
      case SourceCollectionMode.HTML:
        return new HtmlCollector();

      default:
        throw new Error(
          `Aucun collecteur disponible pour le mode "${source.collectionMode}".`,
        );
    }
  }
}