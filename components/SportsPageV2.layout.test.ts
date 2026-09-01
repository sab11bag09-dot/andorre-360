import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const source = readFileSync(
  new URL("./SportsPageV2.tsx", import.meta.url),
  "utf8",
);

describe("mise en page Sports", () => {
  it("conserve la répartition éditoriale", () => {
    expect(source).toContain(
      'const items = await getArticlesByCategory("SPORTS");',
    );
    expect(source).toContain("const rightCards = items.slice(3, 6);");
    expect(source).toContain("const briefs = items.slice(6, 12);");
    expect(source).toContain("const bottomCards = items.slice(12, 16);");
    expect(source).toContain("const bonASavoir = items[16];");
  });

  it("limite le titre et le chapô du hero", () => {
    expect(source).toContain(
      'className="mt-4 line-clamp-2 max-h-[7rem] overflow-hidden font-serif text-4xl leading-[1.15] md:text-5xl"',
    );
    expect(source).toContain(
      'className="mt-4 line-clamp-2 h-12 max-h-12 overflow-hidden leading-6 text-gray-300"',
    );
  });

  it("conserve six brèves uniformes", () => {
    expect(source).toContain("{/* SIX BRÈVES */}");
    expect(source).toContain("md:auto-rows-[150px] md:grid-cols-3");
    expect(source).toContain(
      'className="line-clamp-3 font-serif text-lg leading-snug"',
    );
  });

  it("conserve quatre cartes de pied identiques", () => {
    expect(source).toContain(
      "{/* QUATRE CARTES DE PIED SUR LES 4 COLONNES */}",
    );
    expect(source).toContain("const bottomCards = items.slice(12, 16);");
    expect(source).toContain(
      'className="flex h-[460px] flex-col overflow-hidden rounded-xl',
    );
  });

  it("limite Question à et les cartes droites", () => {
    expect(source).toContain(
      'className="mt-3 line-clamp-2 h-14 max-h-14 overflow-hidden font-serif text-2xl leading-7"',
    );
    expect(source).toContain(
      'className="mt-3 line-clamp-3 h-[4.5rem] max-h-[4.5rem] overflow-hidden text-sm leading-6 text-gray-400"',
    );
    expect(source).toContain(
      'className="line-clamp-3 h-[4.5rem] max-h-[4.5rem] overflow-hidden font-serif text-lg leading-6"',
    );
  });

  it("limite le bloc Bon à savoir", () => {
    expect(source).toContain(
      'className="mt-4 line-clamp-2 overflow-hidden font-serif text-2xl leading-7"',
    );
    expect(source).toContain(
      'className="mt-4 line-clamp-3 overflow-hidden leading-6 text-gray-400"',
    );
  });

  it("conserve la vidéo de l’article principal", () => {
    expect(source).toContain(
      'import MediaPreview from "@/components/article/MediaPreview";',
    );
    expect(source).toContain("videoUrl={mainArticle.videoUrl}");
  });
});
