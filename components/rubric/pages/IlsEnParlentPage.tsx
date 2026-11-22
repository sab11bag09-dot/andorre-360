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

/**
 * Rubrique « Ils en parlent », qui reprend aussi les anciens articles
 * Immobilier : une, article principal, six brèves, deux cartes sans image ;
 * à droite, Question à… et deux cartes. Les trois cartes du bas (deux
 * grandes photos et une carte latérale) ont été retirées le 22 novembre 2026,
 * à la demande de l’utilisateur : la page était trop chargée.
 */
export default async function IlsEnParlentPage() {
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
  } = allocateRubricSlots(items, {
    hero: 1,
    main: 1,
    question: 1,
    side: 2,
    briefs: 6,
    middle: 2,
  });

  const heights = RUBRIC_XL_HEIGHTS.ilsEnParlent;

  return (
    <RubricPage
      hero={
        featured && (
          <RubricHero
            article={featured}
            categoryLabel={
              featured.category === "IMMOBILIER" || featured.category === "ILS_EN_PARLENT"
                ? "ILS EN PARLENT"
                : featured.category
            }
          />
        )
      }
      aside={rubricColumn(heights.aside, [
        questionArticle && (
          <RubricQuestionCard article={questionArticle} fallbackImage={featured?.image} />
        ),
        side[0] && <RubricImageCard article={side[0]} size="side" />,
        side[1] && <RubricImageCard article={side[1]} size="side" />,
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
          middle.length > 0 && (
            <RubricGrid columns={2} rows={1} fill>
              {middle.map((article) => (
                <RubricTextCard key={article.id} article={article} />
              ))}
            </RubricGrid>
          ),
        ],
        { fill: 2 },
      )}
    />
  );
}
