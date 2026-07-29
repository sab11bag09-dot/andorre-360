import { Source } from "@/lib/generated/prisma/client";

export interface ObservationInput {
  title: string;
  url: string;
  publishedAt: Date | null;
  content: string | null;
}

export interface Collector {
  collect(
    source: Source,
  ): Promise<ObservationInput[]>;
}