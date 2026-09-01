import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const source = readFileSync(
  new URL("./PolitiquePageV2.tsx", import.meta.url),
  "utf8",
);

function countOccurrences(value: string): number {
  return source.split(value).length - 1;
}

describe("mise en page Politique", () => {
  it("limite le titre et le chapô du hero", () => {
    expect(source).toContain(
      'className="mt-4 line-clamp-2 max-h-[7rem] overflow-hidden font-serif text-4xl leading-[1.15] md:text-5xl"',
    );

    expect(source).toContain(
      'className="mt-4 line-clamp-2 h-12 max-h-12 overflow-hidden leading-6 text-gray-300"',
    );
  });

  it("conserve six brèves uniformes avec trois lignes maximum", () => {
    expect(source).toContain("{/* SIX BRÈVES */}");

    expect(source).toContain(
      'className="flex h-[150px] max-h-[150px] flex-col justify-between overflow-hidden',
    );

    expect(source).toContain(
      'className="line-clamp-3 overflow-hidden font-serif text-lg leading-6"',
    );
  });

  it("conserve deux grands formats compacts et identiques", () => {
    expect(source).toContain("{/* DEUX PAPIERS DE PIED SUR LES 4 COLONNES */}");

    expect(source).toContain('className="mt-10 grid gap-8 md:grid-cols-2"');

    expect(countOccurrences('className="relative h-48 shrink-0"')).toBe(2);

    expect(countOccurrences('className="flex h-[132px] flex-col p-5"')).toBe(2);

    expect(
      countOccurrences(
        'className="line-clamp-2 h-14 max-h-14 overflow-hidden font-serif text-2xl leading-7"',
      ),
    ).toBe(2);
  });

  it("conserve un rythme naturel sans alignement artificiel", () => {
    expect(source).not.toContain("lg:mt-auto");
    expect(source).not.toContain("lg:flex-1");
    expect(source).not.toContain('className="mt-auto block"');
    expect(source).not.toContain("h-80 flex-col");
  });

  it("limite Question à et Bon à savoir", () => {
    expect(source).toContain(
      'className="mt-3 line-clamp-2 h-14 max-h-14 overflow-hidden font-serif text-2xl leading-7"',
    );

    expect(source).toContain(
      'className="mt-4 line-clamp-2 overflow-hidden font-serif text-2xl leading-7"',
    );

    expect(source).toContain(
      'className="mt-4 line-clamp-3 overflow-hidden leading-6 text-gray-400"',
    );
  });

  it("conserve les vidéos principales et Question à", () => {
    expect(source).toContain(
      'import MediaPreview from "@/components/article/MediaPreview";',
    );

    expect(source).toContain("videoUrl={mainArticle.videoUrl}");

    expect(source).toContain("videoUrl={questionArticle.videoUrl}");
  });
  it("conserve la répartition éditoriale des articles", () => {
    expect(source).toContain(
      'const items = await getArticlesByCategory("POLITIQUE");',
    );
    expect(source).toContain("const rightCards = items.slice(3, 6);");
    expect(source).toContain("const briefs = items.slice(6, 12);");
    expect(source).toContain("const middleCard = items[14];");
    expect(source).toContain("const secondMiddleCard = items[15];");
    expect(source).toContain("const bottomCard = items[16];");
    expect(source).toContain("const secondBottomCard = items[17];");
    expect(source).toContain("const bonASavoir = items[18];");
    expect(source).not.toContain("bonASavoirBrief");
  });

  it("conserve les dimensions des autres cartes", () => {
    expect(source).toContain(
      'className="h-[4.5rem] max-h-[4.5rem] overflow-hidden font-serif text-3xl leading-9"',
    );

    expect(source).toContain(
      'className="mt-4 h-12 max-h-12 overflow-hidden text-gray-400 leading-6"',
    );

    expect(
      countOccurrences(
        'className="h-[220px] max-h-[220px] overflow-hidden rounded-xl',
      ),
    ).toBe(2);

    expect(source).toContain(
      'className="h-[4.5rem] max-h-[4.5rem] overflow-hidden font-serif text-lg leading-6"',
    );
  });
});
