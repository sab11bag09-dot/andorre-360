import {
  RubricBriefCard,
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

/** Rubrique « Ils en parlent », qui reprend aussi les anciens articles Immobilier. */
export default async function ImmobilierPageV2({
  showMiddleCards = false,
}: {
  showMiddleCards?: boolean;
}) {
  const [currentItems, legacyItems] = await Promise.all([
    getArticlesByCategory("ILS_EN_PARLENT"),
    getArticlesByCategory("IMMOBILIER"),
  ]);

  const items = [...currentItems, ...legacyItems].sort((a, b) => {
    const aDate = a.publishedAt?.getTime() ?? a.createdAt.getTime();
    const bDate = b.publishedAt?.getTime() ?? b.createdAt.getTime();
    return bDate - aDate;
  });

  const {
    hero: [featured],
    main: [mainArticle],
    question: [questionArticle],
    side,
    briefs,
    middle,
    bottom,
  } = allocateRubricSlots(items, {
    hero: 1,
    main: 1,
    question: 1,
    side: 3,
    briefs: 6,
    bottom: 2,
    // En dernier : sans les cartes du milieu, aucun article n’est sauté.
    middle: 2,
  });

  return (
    <RubricPage
      hero={
        featured && (
          <RubricHero
            article={featured}
            categoryLabel={
              featured.category === "IMMOBILIER" ? "ILS EN PARLENT" : featured.category
            }
          />
        )
      }
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

      {showMiddleCards && middle.length > 0 && (
        <RubricGrid columns={2}>
          {middle.map((article) => (
            <RubricTextCard key={article.id} article={article} />
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
