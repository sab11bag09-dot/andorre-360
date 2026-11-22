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
import { allocateRubricSlots } from "@/lib/rubric/allocateRubricSlots";
import { RUBRIC_XL_HEIGHTS } from "@/lib/rubric/rubricXlHeights";

export const dynamic = "force-dynamic";

/**
 * Rubrique Sports, allégée le 22 novembre 2026 à la demande de
 * l’utilisateur : une, article principal, trois brèves et deux cartes photo ;
 * à droite, Question à… et deux cartes. La deuxième rangée de brèves, la
 * deuxième rangée de cartes photo, la troisième carte latérale et Bon à
 * savoir ont été retirées.
 */
export default async function SportsPageV2() {
  const items = await getArticlesByCategory("SPORTS");

  const {
    hero: [featured],
    main: [mainArticle],
    question: [questionArticle],
    side,
    briefs,
    bottom,
  } = allocateRubricSlots(items, {
    hero: 1,
    main: 1,
    question: 1,
    side: 2,
    briefs: 3,
    bottom: 2,
  });

  const heights = RUBRIC_XL_HEIGHTS.sports;

  return (
    <RubricPage
      hero={featured && <RubricHero article={featured} />}
      aside={rubricColumn(
        heights.aside,
        [
        questionArticle && (
          <RubricQuestionCard article={questionArticle} fallbackImage={featured?.image} />
        ),
        // Les cartes remplissent leur bloc agrandi : la photo prend les 24 px.
        side[0] && <RubricImageCard article={side[0]} size="side" stretch />,
        side[1] && <RubricImageCard article={side[1]} size="side" stretch />,
        ],
        { fill: 2 },
      )}
      main={rubricColumn(
        heights.main,
        [
          mainArticle && <RubricMainCard article={mainArticle} />,
          briefs.length > 0 && (
            <RubricGrid columns={3} rows={1}>
              {briefs.map((article) => (
                <RubricBriefCard key={article.id} article={article} />
              ))}
            </RubricGrid>
          ),
          bottom.length > 0 && (
            <RubricGrid columns={2} rows={1} fill>
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
