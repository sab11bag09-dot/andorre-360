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
} from "@/components/rubric/RubricCards";
import { getArticlesByCategory } from "@/lib/articles";
import { allocateRubricSlots } from "@/lib/rubric/allocateRubricSlots";

/**
 * Plan commun des rubriques d’information (Économie, Politique, Société,
 * International) : une, article principal, six brèves, deux cartes sans
 * image, deux cartes avec image ; à droite, Question à…, trois cartes et
 * Bon à savoir.
 */
export default async function NewsRubricPage({
  category,
  partner,
}: {
  category: string;
  partner?: { href: string; label: string };
}) {
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
    side: 3,
    briefs: 6,
    middle: 2,
    bottom: 2,
    goodToKnow: 1,
    goodToKnowBrief: 1,
  });

  return (
    <RubricPage
      hero={featured && <RubricHero article={featured} />}
      aside={
        <>
          {partner && <RubricPartnerLink href={partner.href} label={partner.label} />}

          {questionArticle && (
            <RubricQuestionCard article={questionArticle} fallbackImage={featured?.image} />
          )}

          {side.map((article) => (
            <RubricImageCard
              key={article.id}
              article={article}
              size="side"
              showDescription={false}
            />
          ))}

          {goodToKnow && <RubricGoodToKnow article={goodToKnow} brief={goodToKnowBrief} />}
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

      {middle.length > 0 && (
        <RubricGrid columns={2}>
          {middle.map((article) => (
            <RubricTextCard key={article.id} article={article} />
          ))}
        </RubricGrid>
      )}

      {bottom.length > 0 && (
        <RubricGrid columns={2} fill>
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
      )}
    </RubricPage>
  );
}
