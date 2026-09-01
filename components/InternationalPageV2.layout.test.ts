import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const source = readFileSync(
  new URL("./InternationalPageV2.tsx", import.meta.url),
  "utf8",
);

function countOccurrences(value: string): number {
  return source.split(value).length - 1;
}

describe("mise en page International", () => {
  it("conserve la répartition éditoriale sans doublon", () => {
    expect(source).toContain(
      'const items = await getArticlesByCategory("INTERNATIONAL");',
    );
    expect(source).toContain("const rightCards = items.slice(3, 6);");
    expect(source).toContain("const briefs = items.slice(6, 12);");
    expect(source).toContain("const middleCard = items[14];");
    expect(source).toContain("const secondMiddleCard = items[15];");
    expect(source).toContain("const bottomCard = items[16];");
    expect(source).toContain("const secondBottomCard = items[17];");
    expect(source).toContain("const bonASavoir = items[18];");
    expect(source).not.toContain("const bonASavoir = items[14];");
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

  it("conserve les dimensions de l’article principal", () => {
    expect(source).toContain('className="relative h-[420px]"');
    expect(source).toContain(
      'className="h-[4.5rem] max-h-[4.5rem] overflow-hidden font-serif text-3xl leading-9"',
    );
    expect(source).toContain(
      'className="mt-4 h-12 max-h-12 overflow-hidden text-gray-400 leading-6"',
    );
  });

  it("conserve six brèves et leur hauteur de titre", () => {
    expect(source).toContain("{/* SIX BRÈVES */}");
    expect(source).toContain('className="mt-8 grid gap-4 md:grid-cols-3"');
    expect(source).toContain(
      'className="h-24 max-h-24 overflow-hidden font-serif text-lg leading-6"',
    );
  });

  it("conserve deux cartes intermédiaires identiques", () => {
    expect(
      countOccurrences(
        'className="h-[220px] max-h-[220px] overflow-hidden rounded-xl',
      ),
    ).toBe(2);

    expect(
      countOccurrences(
        'className="h-14 max-h-14 overflow-hidden font-serif text-2xl leading-7"',
      ),
    ).toBeGreaterThanOrEqual(4);
  });

  it("conserve deux cartes de pied identiques", () => {
    expect(source).toContain("{/* DEUX PAPIERS DE PIED SUR LES 4 COLONNES */}");
    expect(countOccurrences('className="relative h-64"')).toBe(2);
    expect(source).toContain("{bottomCard.description}");
    expect(source).toContain("{secondBottomCard.description}");
  });

  it("conserve Question à, trois cartes et Bon à savoir", () => {
    expect(source).toContain("{/* QUESTION À... */}");
    expect(source).toContain("{/* TROIS CARTES CLASSIQUES */}");
    expect(source).toContain("{/* BON À SAVOIR */}");

    expect(source).toContain("rightCards.map((article, index) =>");
    expect(source).toContain(
      'className="mt-3 h-[5.25rem] max-h-[5.25rem] overflow-hidden font-serif text-2xl leading-7"',
    );
    expect(source).toContain(
      'className="mt-4 h-[5.25rem] max-h-[5.25rem] overflow-hidden font-serif text-2xl leading-7"',
    );
    expect(source).toContain(
      'className="mt-4 h-24 max-h-24 overflow-hidden leading-6 text-gray-400"',
    );
  });
});
