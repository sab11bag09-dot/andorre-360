import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const source = readFileSync(
  new URL("./SocietePageV2.tsx", import.meta.url),
  "utf8",
);

function countOccurrences(value: string): number {
  return source.split(value).length - 1;
}

describe("mise en page Société", () => {
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

  it("conserve deux cartes de pied compactes et alignées", () => {
    expect(source).toContain("{/* DEUX PAPIERS DE PIED SUR LES 4 COLONNES */}");

    expect(source).toContain(
      'className="mt-10 grid gap-8 md:grid-cols-2 lg:mt-auto lg:flex-none lg:pt-10"',
    );

    expect(countOccurrences('className="relative h-48 shrink-0"')).toBe(2);

    expect(countOccurrences('className="flex h-[132px] flex-col p-5"')).toBe(2);

    expect(
      countOccurrences(
        'className="line-clamp-2 h-14 max-h-14 overflow-hidden font-serif text-2xl leading-7"',
      ),
    ).toBe(2);
  });

  it("conserve Bon à savoir sans brève supplémentaire", () => {
    expect(source).toContain("{/* BON À SAVOIR */}");
    expect(source).not.toContain("bonASavoirBrief");
  });

  it("conserve Andorra Signature et les vidéos", () => {
    expect(source).toContain("https://www.andorrasignature.com");

    expect(source).toContain(
      'import MediaPreview from "@/components/article/MediaPreview";',
    );

    expect(source).toContain("videoUrl={mainArticle.videoUrl}");

    expect(source).toContain("videoUrl={questionArticle.videoUrl}");
  });
});
