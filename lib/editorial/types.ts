import type { Article } from "@/lib/generated/prisma/client";

export type EditorialLayout = {
  hero: Article | null;
  feature: Article | null;
  secondary: Article[];
  card: Article[];
  briefs: Article[];
  grandFormat: Article | null;
  question: Article | null;
  goodToKnow: Article[];
  editorial: Article | null;
  discover: Article[];
};