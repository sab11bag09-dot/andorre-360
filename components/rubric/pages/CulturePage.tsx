import {
  RubricBriefCard,
  RubricGrid,
  RubricHero,
  RubricImageCard,
  RubricMainCard,
  RubricPage,
  rubricColumn,
} from "@/components/rubric/RubricCards";
import { getArticlesByCategory } from "@/lib/articles";
import { allocateRubricSlots } from "@/lib/rubric/allocateRubricSlots";
import { RUBRIC_XL_HEIGHTS } from "@/lib/rubric/rubricXlHeights";

export const dynamic = "force-dynamic";

/**
 * Rubrique Culture, ajustée le 22 novembre 2026 à la demande de
 * l’utilisateur : photos du bas moins hautes, et la carte « Question à… »
 * retirée de la colonne latérale, remplacée par une quatrième carte.
 */
export default async function CulturePage() {
  const items = await getArticlesByCategory("CULTURE");

  const {
    hero: [featured],
    main: [mainArticle],
    side,
    briefs,
    bottom,
  } = allocateRubricSlots(items, {
    hero: 1,
    main: 1,
    side: 4,
    briefs: 6,
    bottom: 2,
  });

  const heights = RUBRIC_XL_HEIGHTS.culture;

  return (
    <RubricPage
      hero={featured && <RubricHero article={featured} />}
      aside={rubricColumn(
        heights.aside,
        [0, 1, 2, 3].map(
          (index) =>
            side[index] && (
              <RubricImageCard key={side[index].id} article={side[index]} size="side" />
            ),
        ),
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
