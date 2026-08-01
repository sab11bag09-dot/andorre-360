import { Source } from "@/lib/generated/prisma/client";

import { Collector } from "../collectors/Collector";

export interface CollectorFactoryInterface {
  create(source: Source): Collector;
}