import { prisma } from "@/lib/prisma";

/**
 * Crédit public des sources d’un article.
 *
 * Un article rédigé à partir d’une observation est signé par la rédaction
 * (`editorialSignature.ts`) ; la page publique indique en plus la source
 * dont il est tiré, avec un lien vers l’article d’origine. Chaque source
 * n’est créditée qu’une fois, dans l’ordre des observations rattachées.
 */
export type ArticleSourceCredit = {
  name: string;
  /** Adresse de l’article d’origine, ou `null` si elle n’est pas une adresse web. */
  url: string | null;
};

export type ObservationForSourceCredit = {
  id: number;
  url: string;
  source: { id: number; name: string };
};

export type SourceCreditLanguage = "fr" | "ca" | "es";

const LABELS: Record<SourceCreditLanguage, { one: string; many: string }> = {
  fr: { one: "Source", many: "Sources" },
  ca: { one: "Font", many: "Fonts" },
  es: { one: "Fuente", many: "Fuentes" },
};

export function sourceCreditLabel(
  language: SourceCreditLanguage,
  count: number,
): string {
  return count > 1 ? LABELS[language].many : LABELS[language].one;
}

function webAddress(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export function buildArticleSourceCredits(
  observations: readonly ObservationForSourceCredit[],
): ArticleSourceCredit[] {
  const credited = new Set<number>();
  const credits: ArticleSourceCredit[] = [];

  for (const observation of [...observations].sort((a, b) => a.id - b.id)) {
    const name = observation.source.name.trim();
    if (!name || credited.has(observation.source.id)) continue;

    credited.add(observation.source.id);
    credits.push({ name, url: webAddress(observation.url) });
  }

  return credits;
}

type SourceCreditClient = {
  observation: {
    findMany(args: {
      where: { articleId: number };
      select: {
        id: true;
        url: true;
        source: { select: { id: true; name: true } };
      };
      orderBy: { id: "asc" };
    }): Promise<ObservationForSourceCredit[]>;
  };
};

export async function loadArticleSourceCredits(
  articleId: number,
  client: SourceCreditClient = prisma,
): Promise<ArticleSourceCredit[]> {
  const observations = await client.observation.findMany({
    where: { articleId },
    select: {
      id: true,
      url: true,
      source: { select: { id: true, name: true } },
    },
    orderBy: { id: "asc" },
  });

  return buildArticleSourceCredits(observations);
}
