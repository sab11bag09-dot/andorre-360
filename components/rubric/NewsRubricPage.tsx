import {
  RubricBriefCard,
  RubricGoodToKnow,
  RubricGrid,
  RubricHero,
  RubricImageCard,
  RubricMainCard,
  RubricPage,
  RubricPartnerLink,
  RubricQuestionCard,
  RubricTextCard,
  rubricColumn,
} from "@/components/rubric/RubricCards";
import { getArticlesByCategory } from "@/lib/articles";
import { allocateRubricSlots } from "@/lib/rubric/allocateRubricSlots";
import { RUBRIC_XL_HEIGHTS } from "@/lib/rubric/rubricXlHeights";

/**
 * Plan commun des rubriques d’information (Économie, Politique, Société,
 * International) : une, article principal, six brèves, deux cartes sans
 * image, deux cartes avec image ; à droite, Question à…, trois cartes et
 * Bon à savoir.
 */
export default async function NewsRubricPage({
  category,
  partner,
  compactBottom = false,
}: {
  category: string;
  partner?: { href: string; label: string };
  /** Photos du bas moins hautes et deux cartes latérales au lieu de trois (Économie, Société, Politique). */
  compactBottom?: boolean;
}) {
  const sideCount = compactBottom ? 2 : 3;
  const items = await getArticlesByCategory(category);

  const {
    hero: [featured],
    main: [mainArticle],
    question: [questionArticle],
    side,
    briefs,
    middle,
    bottom,
    goodToKnow: [goodToKnow],
    goodToKnowBrief: [goodToKnowBrief],
  } = allocateRubricSlots(items, {
    hero: 1,
    main: 1,
    question: 1,
    side: sideCount,
    briefs: 6,
    middle: 2,
    bottom: 2,
    goodToKnow: 1,
    goodToKnowBrief: 1,
  });

  const heights = partner
    ? compactBottom
      ? RUBRIC_XL_HEIGHTS.newsWithPartnerCompact
      : RUBRIC_XL_HEIGHTS.newsWithPartner
    : compactBottom
      ? RUBRIC_XL_HEIGHTS.newsCompact
      : RUBRIC_XL_HEIGHTS.news;
  const sideCards = Array.from({ length: sideCount }, (_, index) => index).map(
    (index) =>
      side[index] && (
        <RubricImageCard key={side[index].id} article={side[index]} size="side" showDescription={false} />
      ),
  );

  return (
    <RubricPage
      hero={featured && <RubricHero article={featured} />}
      aside={rubricColumn(heights.aside, [
        ...(partner ? [<RubricPartnerLink key="partner" href={partner.href} label={partner.label} />] : []),
        questionArticle && (
          <RubricQuestionCard article={questionArticle} fallbackImage={featured?.image} />
        ),
        ...sideCards,
        goodToKnow && <RubricGoodToKnow article={goodToKnow} brief={goodToKnowBrief} />,
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
            <RubricGrid columns={2} rows={1}>
              {middle.map((article) => (
                <RubricTextCard key={article.id} article={article} />
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
                  showDescription={false}
                  stretch
                />
              ))}
            </RubricGrid>
          ),
        ],
        { fill: 3 },
      )}
    />
  );
}
