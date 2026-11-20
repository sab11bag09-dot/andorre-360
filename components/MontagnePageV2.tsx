import {
  RubricGrid,
  RubricHero,
  RubricImageCard,
  RubricMainCard,
  RubricPage,
  RubricQuestionCard,
  RubricTextCard,
} from "@/components/rubric/RubricCards";
import { getArticlesByCategory } from "@/lib/articles";
import { allocateRubricSlots } from "@/lib/rubric/allocateRubricSlots";

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

  return (
    <RubricPage
      hero={featured && <RubricHero article={featured} />}
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

      {/* Deux cartes sans photo, puis quatre cartes avec photo. */}
      {textCards.length > 0 && (
        <RubricGrid columns={2}>
          {textCards.map((article) => (
            <RubricTextCard key={article.id} article={article} />
          ))}
        </RubricGrid>
      )}

      {imageCards.length > 0 && (
        <RubricGrid columns={2} fill>
          {imageCards.map((article) => (
            <RubricImageCard key={article.id} article={article} size="wide" stretch />
          ))}
        </RubricGrid>
      )}
    </RubricPage>
  );
}
