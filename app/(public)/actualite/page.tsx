import SafeImage from "@/components/SafeImage";
import {
  RubricBriefCard,
  RubricGoodToKnow,
  RubricGrid,
  RubricHero,
  RubricImageCard,
  RubricMainCard,
  RubricPage,
  RubricPartnerLink,
} from "@/components/rubric/RubricCards";
import { getArticlesByCategory } from "@/lib/articles";
import { prisma } from "@/lib/prisma";
import { allocateRubricSlots } from "@/lib/rubric/allocateRubricSlots";

export const dynamic = "force-dynamic";

function AdvertisementBlock({
  imagePath,
  targetUrl,
  sizes,
}: {
  imagePath: string;
  targetUrl: string;
  sizes: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-yellow-500">
      <a href={targetUrl} target="_blank" rel="noopener noreferrer" className="block">
        <div className="relative h-[480px]">
          <SafeImage src={imagePath} alt="Publicité" fill sizes={sizes} className="object-cover" />
        </div>

        <div className="bg-yellow-500 px-5 py-4 text-center text-sm font-semibold uppercase tracking-[0.15em] text-black">
          Découvrir le site
        </div>
      </a>
    </div>
  );
}

export default async function ActualitePage() {
  const [items, advertisements] = await Promise.all([
    getArticlesByCategory("ACTUALITÉ"),
    prisma.advertisement.findMany({
      where: {
        pageKey: "actualite",
        active: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  const activeAdvertisement = advertisements.find((advertisement) => {
    const now = new Date();

    return (
      (!advertisement.startsAt || advertisement.startsAt <= now) &&
      (!advertisement.endsAt || advertisement.endsAt >= now)
    );
  });

  const {
    hero: [featured],
    main: [mainArticle],
    side,
    briefs,
    bottom,
    goodToKnow: [goodToKnow],
  } = allocateRubricSlots(items, {
    hero: 1,
    main: 1,
    side: 4,
    briefs: 6,
    bottom: 2,
    goodToKnow: 1,
  });

  return (
    <RubricPage
      hero={featured && <RubricHero article={featured} />}
      aside={
        <>
          <RubricPartnerLink
            href="https://www.andorracorporate.com"
            label="Visiter Andorra Corporate"
          />

          {side.map((article) => (
            <RubricImageCard
              key={article.id}
              article={article}
              size="side"
              showDescription={false}
            />
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

      {activeAdvertisement?.format === "FOUR_COLUMNS" && (
        <AdvertisementBlock
          imagePath={activeAdvertisement.imagePath}
          targetUrl={activeAdvertisement.targetUrl}
          sizes="(max-width: 1024px) 100vw, 66vw"
        />
      )}

      {activeAdvertisement?.format === "TWO_COLUMNS_WITH_CARD" && (
        <RubricGrid columns={2}>
          <AdvertisementBlock
            imagePath={activeAdvertisement.imagePath}
            targetUrl={activeAdvertisement.targetUrl}
            sizes="(max-width: 768px) 100vw, 50vw"
          />

          {bottom[0] && (
            <RubricImageCard article={bottom[0]} size="wide" showDescription={false} stretch />
          )}
        </RubricGrid>
      )}

      {!activeAdvertisement && bottom.length > 0 && (
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
