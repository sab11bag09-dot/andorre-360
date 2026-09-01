import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");

function countOccurrences(value: string): number {
  return source.split(value).length - 1;
}

describe("mise en page Actualité", () => {
  it("conserve la source éditoriale et les emplacements", () => {
    expect(source).toContain('getArticlesByCategory("ACTUALITÉ")');
    expect(source).toContain("const rightCards = items.slice(2, 6);");
    expect(source).toContain("const briefs = items.slice(6, 12);");
    expect(source).toContain("const bottomCard = items[12];");
    expect(source).toContain("const secondBottomCard = items[13];");
    expect(source).toContain("const bonASavoir = items[14];");
  });

  it("conserve la sélection des publicités actives", () => {
    expect(source).toContain("prisma.advertisement.findMany");
    expect(source).toContain('pageKey: "actualite"');
    expect(source).toContain("active: true");
    expect(source).toContain(
      "!advertisement.startsAt || advertisement.startsAt <= now",
    );
    expect(source).toContain(
      "!advertisement.endsAt || advertisement.endsAt >= now",
    );
  });

  it("conserve les deux formats publicitaires", () => {
    expect(source).toContain('activeAdvertisement?.format === "FOUR_COLUMNS"');
    expect(source).toContain(
      'activeAdvertisement?.format === "TWO_COLUMNS_WITH_CARD"',
    );
    expect(source).toContain("href={activeAdvertisement.targetUrl}");
    expect(source).toContain("src={activeAdvertisement.imagePath}");
    expect(source).toContain("Découvrir le site");
  });

  it("conserve les dimensions du hero", () => {
    expect(source).toContain(
      'className="relative h-[60vh] min-h-[480px] overflow-hidden"',
    );
    expect(source).toContain(
      'className="mt-4 h-[7rem] max-h-[7rem] overflow-hidden font-serif text-4xl leading-[1.15] md:text-5xl"',
    );
    expect(source).toContain(
      'className="mt-4 h-12 max-h-12 overflow-hidden text-gray-300 leading-6"',
    );
  });

  it("conserve la vidéo de l’article principal", () => {
    expect(source).toContain(
      'import MediaPreview from "@/components/article/MediaPreview";',
    );
    expect(source).toContain("videoUrl={mainArticle.videoUrl}");
    expect(source).toContain('mode="featured"');
    expect(source).toContain('className="relative h-[420px]"');
  });

  it("conserve les six brèves uniformes", () => {
    expect(source).toContain("const briefs = items.slice(6, 12);");
    expect(source).toContain(
      'className="mt-8 grid gap-4 md:grid-cols-3 md:auto-rows-[150px]"',
    );
    expect(source).toContain(
      'className="flex h-full max-h-[150px] flex-col justify-between overflow-hidden',
    );
    expect(source).toContain(
      'className="h-[4.5rem] max-h-[4.5rem] overflow-hidden font-serif text-lg leading-6"',
    );
  });

  it("conserve les vidéos des quatre cartes de droite", () => {
    expect(source).toContain("rightCards.map((article, index) =>");
    expect(source).toContain("videoUrl={article.videoUrl}");
    expect(source).toContain('mode={index === 0 ? "featured" : "thumbnail"}');
    expect(source).toContain('index === 3 ? "h-48" : "h-40"');
  });

  it("conserve Andorra Corporate", () => {
    expect(source).toContain('href="https://www.andorracorporate.com"');
    expect(source).toContain("Visiter Andorra Corporate");
    expect(source).toContain('rel="noopener noreferrer"');
  });

  it("conserve les deux cartes de pied identiques sans publicité", () => {
    expect(source).toContain(
      "!activeAdvertisement && (bottomCard || secondBottomCard)",
    );
    expect(
      countOccurrences(
        'className="line-clamp-2 overflow-hidden font-serif text-2xl leading-tight"',
      ),
    ).toBe(2);
    expect(source).toContain("{bottomCard.title}");
    expect(source).toContain("{secondBottomCard.title}");
  });

  it("conserve la carte associée au format publicitaire mixte", () => {
    expect(source).toContain(
      'activeAdvertisement?.format === "TWO_COLUMNS_WITH_CARD"',
    );
    expect(source).toContain('className="relative h-[370px]"');
    expect(source).toContain("{bottomCard.title}");
  });

  it("conserve le bloc Bon à savoir", () => {
    expect(source).toContain("{/* BON À SAVOIR */}");
    expect(source).toContain(
      'className="mt-4 line-clamp-2 font-serif text-2xl leading-snug"',
    );
    expect(source).toContain(
      'className="mt-4 line-clamp-5 leading-relaxed text-gray-400"',
    );
  });
});
