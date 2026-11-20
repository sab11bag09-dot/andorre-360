import {
  RubricBriefCard,
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

  const heights = showMiddleCards
    ? RUBRIC_XL_HEIGHTS.ilsEnParlent
    : RUBRIC_XL_HEIGHTS.ilsEnParlentSansMilieu;
  const middleCards = middle.length > 0 && (
    <RubricGrid columns={2} rows={1}>
      {middle.map((article) => (
        <RubricTextCard key={article.id} article={article} />
      ))}
    </RubricGrid>
  );

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
      aside={rubricColumn(
        heights.aside,
        [
          questionArticle && (
            <RubricQuestionCard article={questionArticle} fallbackImage={featured?.image} />
          ),
          side[0] && <RubricImageCard article={side[0]} size="side" />,
          side[1] && <RubricImageCard article={side[1]} size="side" />,
          side[2] && <RubricImageCard article={side[2]} size="side" stretch />,
        ],
        { fill: 3 },
      )}
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
          ...(showMiddleCards ? [middleCards] : []),
          bottom.length > 0 && (
            <RubricGrid columns={2} rows={1} fill>
              {bottom.map((article) => (
                <RubricImageCard key={article.id} article={article} size="wide" stretch />
              ))}
            </RubricGrid>
          ),
        ],
        { fill: showMiddleCards ? 3 : 2 },
      )}
    />
  );
}
