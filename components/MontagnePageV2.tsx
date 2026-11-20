import {
  RubricGrid,
  RubricHero,
  RubricImageCard,
  RubricMainCard,
  RubricPage,
  RubricQuestionCard,
  RubricTextCard,
  rubricColumn,
} from "@/components/rubric/RubricCards";
import { getArticlesByCategory } from "@/lib/articles";
import { allocateRubricSlots } from "@/lib/rubric/allocateRubricSlots";
import { RUBRIC_XL_HEIGHTS } from "@/lib/rubric/rubricXlHeights";

export const dynamic = "force-dynamic";

export default async function MontagnePageV2() {
  const items = await getArticlesByCategory("MONTAGNE");

  const {
    hero: [featured],
    main: [mainArticle],
    question: [questionArticle],
    side,
    textCards,
    imageCards,
  } = allocateRubricSlots(items, {
    hero: 1,
    main: 1,
    question: 1,
    side: 3,
    textCards: 2,
    imageCards: 4,
  });

  const heights = RUBRIC_XL_HEIGHTS.montagne;

  return (
    <RubricPage
      hero={featured && <RubricHero article={featured} />}
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
          textCards.length > 0 && (
            <RubricGrid columns={2} rows={1}>
              {textCards.map((article) => (
                <RubricTextCard key={article.id} article={article} />
              ))}
            </RubricGrid>
          ),
          imageCards.length > 0 && (
            <RubricGrid columns={2} rows={2} fill>
              {imageCards.map((article) => (
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
