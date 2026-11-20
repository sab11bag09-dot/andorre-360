import PasDeLaCasaTraffic from "@/components/PasDeLaCasaTraffic";
import {
  RubricBriefCard,
  RubricGrid,
  RubricHero,
  RubricImageCard,
  RubricMainCard,
  RubricPage,
  RubricQuestionCard,
} from "@/components/rubric/RubricCards";
import { getArticlesByCategory } from "@/lib/articles";
import { buildEditorialLayout } from "@/lib/editorial/engine";

export const dynamic = "force-dynamic";

export default async function LifestylePageV2() {
  const [layout, mountainItems] = await Promise.all([
    buildEditorialLayout("category:LOISIRS"),
    getArticlesByCategory("MONTAGNE"),
  ]);

  type LeisureArticle = Awaited<
    ReturnType<typeof getArticlesByCategory>
  >[number];

  const usedArticleIds = new Set<number>();

  function takeArticle(
    preferred?: LeisureArticle | null,
  ): LeisureArticle | undefined {
    if (preferred && !usedArticleIds.has(preferred.id)) {
      usedArticleIds.add(preferred.id);
      return preferred;
    }

    const fallback = mountainItems.find(
      (article) => !usedArticleIds.has(article.id),
    );

    if (fallback) {
      usedArticleIds.add(fallback.id);
    }

    return fallback;
  }

  function takeArticles(
    preferred: LeisureArticle[],
    count: number,
  ): LeisureArticle[] {
    const selected: LeisureArticle[] = [];

    for (const article of preferred) {
      if (selected.length >= count || usedArticleIds.has(article.id)) {
        continue;
      }

      usedArticleIds.add(article.id);
      selected.push(article);
    }

    while (selected.length < count) {
      const fallback = takeArticle();

      if (!fallback) {
        break;
      }

      selected.push(fallback);
    }

    return selected;
  }

  const featured = takeArticle(layout.hero);
  const mainArticle = takeArticle(layout.feature);
  const questionArticle = takeArticle(layout.question);
  const side = takeArticles(layout.card, 3);
  const briefs = takeArticles(layout.briefs, 6);
  const bottom = [takeArticle(layout.grandFormat), ...takeArticles([], 3)].filter(
    (article): article is LeisureArticle => Boolean(article),
  );

  return (
    <RubricPage
      hero={
        featured && (
          <RubricHero
            article={featured}
            categoryLabel={
              featured.category === "LIFESTYLE" || featured.category === "LOISIRS"
                ? "LOISIRS"
                : featured.category
            }
          />
        )
      }
      banner={<PasDeLaCasaTraffic />}
      aside={
        <>
          {questionArticle && (
            <RubricQuestionCard article={questionArticle} fallbackImage={featured?.image} />
          )}

          {side.map((article, index) => (
            <RubricImageCard
              key={article.id}
              article={article}
              size="side"
              stretch={index === side.length - 1}
            />
          ))}
        </>
      }
    >
      {mainArticle && <RubricMainCard article={mainArticle} />}

      {briefs.length > 0 && (
        <RubricGrid columns={3}>
          {briefs.map((article) => (
            <RubricBriefCard key={article.id} article={article} />
          ))}
        </RubricGrid>
      )}

      {bottom.length > 0 && (
        <RubricGrid columns={2} fill>
          {bottom.map((article) => (
            <RubricImageCard key={article.id} article={article} size="wide" stretch />
          ))}
        </RubricGrid>
      )}
    </RubricPage>
  );
}
