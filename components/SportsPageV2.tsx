import {
  RubricBriefCard,
  RubricGoodToKnow,
  RubricGrid,
  RubricHero,
  RubricImageCard,
  RubricMainCard,
  RubricPage,
  RubricQuestionCard,
} from "@/components/rubric/RubricCards";
import { getArticlesByCategory } from "@/lib/articles";
import { allocateRubricSlots } from "@/lib/rubric/allocateRubricSlots";

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

  return (
    <RubricPage
      hero={featured && <RubricHero article={featured} />}
      aside={
        <>
          {questionArticle && (
            <RubricQuestionCard article={questionArticle} fallbackImage={featured?.image} />
          )}

          {side.map((article) => (
            <RubricImageCard key={article.id} article={article} size="side" />
          ))}

          {goodToKnow && <RubricGoodToKnow article={goodToKnow} />}
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
