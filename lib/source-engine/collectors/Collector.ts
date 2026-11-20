import { Source } from "@/lib/generated/prisma/client";

export interface ObservationInput {
  title: string;
  url: string;
  publishedAt: Date | null;
  content: string | null;
  /** Image de partage déclarée par l’article, sans décision de réutilisation. */
  imageUrl?: string | null;
  /** Mention de droits relevée sur la page de l’article. */
  imageRights?: string | null;
}

export interface Collector {
  collect(
    source: Source,
  ): Promise<ObservationInput[]>;
}