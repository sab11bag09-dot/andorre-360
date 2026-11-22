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
  rubricColumn,
} from "@/components/rubric/RubricCards";
import { getArticlesByCategory } from "@/lib/articles";
import { prisma } from "@/lib/prisma";
import { allocateRubricSlots } from "@/lib/rubric/allocateRubricSlots";
import { RUBRIC_XL_HEIGHTS } from "@/lib/rubric/rubricXlHeights";

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
    <div className="flex flex-col overflow-hidden rounded-xl border border-yellow-500 lg:flex-1">
      <a
        href={targetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-1 flex-col"
      >
        {/* Sur grand écran, l’image remplit le bloc figé du bas de colonne
            (436 px depuis le 22 novembre 2026 : plus de hauteur minimale). */}
        <div className="relative h-[480px] xl:h-auto xl:min-h-0 xl:flex-1">
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
    side: 3,
    briefs: 6,
    bottom: 2,
    goodToKnow: 1,
  });

  const heights = RUBRIC_XL_HEIGHTS.actualite;

  // Bas de colonne, de hauteur figée : la publicité y remplace les deux
  // cartes, pour que les colonnes restent alignées.
  const bottomBlock =
    activeAdvertisement?.format === "FOUR_COLUMNS" ? (
      <AdvertisementBlock
        imagePath={activeAdvertisement.imagePath}
        targetUrl={activeAdvertisement.targetUrl}
        sizes="(max-width: 1024px) 100vw, 66vw"
      />
    ) : activeAdvertisement?.format === "TWO_COLUMNS_WITH_CARD" ? (
      <RubricGrid columns={2} rows={1} fill>
        <AdvertisementBlock
          imagePath={activeAdvertisement.imagePath}
          targetUrl={activeAdvertisement.targetUrl}
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        {bottom[0] && (
          <RubricImageCard article={bottom[0]} size="wide" showDescription={false} stretch />
        )}
      </RubricGrid>
    ) : (
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
      )
    );

  return (
    <RubricPage
      hero={featured && <RubricHero article={featured} />}
      aside={rubricColumn(heights.aside, [
        <RubricPartnerLink
          key="partner"
          href="https://www.andorracorporate.com"
          label="Visiter Andorra Corporate"
        />,
        // Trois cartes au lieu de quatre ; chacune agrandit sa photo pour que
        // la colonne finisse au niveau de la colonne principale.
        ...[0, 1, 2].map(
          (index) =>
            side[index] && (
              <RubricImageCard
                key={side[index].id}
                article={side[index]}
                size="side"
                showDescription={false}
                stretch
              />
            ),
        ),
        goodToKnow && <RubricGoodToKnow article={goodToKnow} />,
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
          bottomBlock,
        ],
        { fill: 2 },
      )}
    />
  );
}
