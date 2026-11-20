import PasDeLaCasaTraffic from "@/components/PasDeLaCasaTraffic";
import {
  RubricBriefCard,
  RubricGrid,
  RubricHero,
  RubricImageCard,
  RubricMainCard,
  RubricPage,
  RubricQuestionCard,
  rubricColumn,
} from "@/components/rubric/RubricCards";
import { getArticlesByCategory } from "@/lib/articles";
import { buildEditorialLayout } from "@/lib/editorial/engine";
import { RUBRIC_XL_HEIGHTS } from "@/lib/rubric/rubricXlHeights";

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

  const heights = RUBRIC_XL_HEIGHTS.loisirs;

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
      aside={rubricColumn(heights.aside, [
        questionArticle && (
          <RubricQuestionCard article={questionArticle} fallbackImage={featured?.image} />
        ),
        side[0] && <RubricImageCard article={side[0]} size="side" />,
        side[1] && <RubricImageCard article={side[1]} size="side" />,
        side[2] && <RubricImageCard article={side[2]} size="side" stretch />,
      ], { fill: 3 })}
      main={rubricColumn(
        heights.main,
        [
          mainArticle && <RubricMainCard article={mainArticle} />,
          briefs.length > 0 && (
            <RubricGrid columns={3} rows={2}>
              {briefs.map((article) => (
                <RubricBriefCard key={article.id} article={article} />
              ))}
            </RubricGrid>
          ),
          bottom.length > 0 && (
            <RubricGrid columns={2} rows={2} fill>
              {bottom.map((article) => (
                <RubricImageCard
                  key={article.id}
                  article={article}
                  size="wide"
                  stretch
                />
              ))}
            </RubricGrid>
          ),
        ],
        { fill: 2 },
      )}
    />
  );
}
