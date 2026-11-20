import {
  RubricBriefCard,
  RubricGoodToKnow,
  RubricGrid,
  RubricHero,
  RubricImageCard,
  RubricMainCard,
  RubricPage,
  RubricQuestionCard,
  rubricColumn,
} from "@/components/rubric/RubricCards";
import { getArticlesByCategory } from "@/lib/articles";
import { allocateRubricSlots } from "@/lib/rubric/allocateRubricSlots";
import { RUBRIC_XL_HEIGHTS } from "@/lib/rubric/rubricXlHeights";

export const dynamic = "force-dynamic";

export default async function SportsPageV2() {
  const items = await getArticlesByCategory("SPORTS");

  const {
    hero: [featured],
    main: [mainArticle],
    question: [questionArticle],
    side,
    briefs,
    bottom,
    goodToKnow: [goodToKnow],
  } = allocateRubricSlots(items, {
    hero: 1,
    main: 1,
    question: 1,
    side: 3,
    briefs: 6,
    bottom: 4,
    goodToKnow: 1,
  });

  const heights = RUBRIC_XL_HEIGHTS.sports;

  return (
    <RubricPage
      hero={featured && <RubricHero article={featured} />}
      aside={rubricColumn(heights.aside, [
        questionArticle && (
          <RubricQuestionCard article={questionArticle} fallbackImage={featured?.image} />
        ),
        side[0] && <RubricImageCard article={side[0]} size="side" />,
        side[1] && <RubricImageCard article={side[1]} size="side" />,
        side[2] && <RubricImageCard article={side[2]} size="side" />,
        goodToKnow && <RubricGoodToKnow article={goodToKnow} />,
      ])}
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
