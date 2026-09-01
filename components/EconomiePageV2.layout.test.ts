import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const source = readFileSync(
  new URL("./EconomiePageV2.tsx", import.meta.url),
  "utf8",
);

function countOccurrences(value: string): number {
  return source.split(value).length - 1;
}

describe("mise en page Économie", () => {
  it("conserve les brèves uniformes avec trois lignes maximum", () => {
    expect(source).toContain("{/* SIX BRÈVES */}");
    expect(source).toContain(
      'className="flex h-[150px] max-h-[150px] flex-col justify-between overflow-hidden',
    );
    expect(source).toContain(
      'className="line-clamp-3 overflow-hidden font-serif text-lg leading-6"',
    );
    expect(source).toContain("Lire l’article →");
  });

  it("conserve deux cartes de pied strictement identiques", () => {
    expect(source).toContain("{/* DEUX PAPIERS DE PIED SUR LES 4 COLONNES */}");

    expect(countOccurrences('className="relative h-64 shrink-0"')).toBe(2);

    expect(countOccurrences('className="flex h-[150px] flex-col p-5"')).toBe(2);

    expect(
      countOccurrences(
        'className="line-clamp-2 h-14 max-h-14 overflow-hidden font-serif text-2xl leading-7"',
      ),
    ).toBe(2);
  });

  it("conserve la brève du bloc Bon à savoir", () => {
    expect(source).toContain("const bonASavoirBrief = items[19];");
    expect(source).toContain("{bonASavoirBrief && (");
    expect(source).toContain("border-t border-zinc-700");
  });

  it("conserve Andorra Corporate et les vidéos", () => {
    expect(source).toContain("https://www.andorracorporate.com");
    expect(source).toContain(
      'import MediaPreview from "@/components/article/MediaPreview";',
    );
    expect(source).toContain("videoUrl={mainArticle.videoUrl}");
  });
});
