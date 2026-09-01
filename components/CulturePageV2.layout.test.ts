import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const source = readFileSync(
  new URL("./CulturePageV2.tsx", import.meta.url),
  "utf8",
);

describe("mise en page Culture", () => {
  it("conserve la répartition éditoriale", () => {
    expect(source).toContain(
      'const items = await getArticlesByCategory("CULTURE");',
    );
    expect(source).toContain("const rightCards = items.slice(3, 6);");
    expect(source).toContain("const briefs = items.slice(6, 12);");
    expect(source).toContain("const bottomCard = items[12];");
    expect(source).toContain("const secondBottomCard = items[13];");
  });

  it("conserve le hero actuel", () => {
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
  });

  it("conserve les six brèves", () => {
    expect(source).toContain("{/* SIX BRÈVES */}");
    expect(source).toContain('className="mt-8 grid gap-4 md:grid-cols-3"');
    expect(source).toContain(
      'className="h-14 max-h-14 overflow-hidden font-serif text-lg leading-7"',
    );
  });

  it("conserve les deux cartes de pied", () => {
    expect(source).toContain("{/* DEUX PAPIERS DE PIED SUR LES 4 COLONNES */}");
    expect(source).toContain("bottomCard || secondBottomCard");
    expect(source).toContain('className="relative h-64 max-h-64"');
  });

  it("conserve Question à et les trois cartes latérales", () => {
    expect(source).toContain("{/* QUESTION À... */}");
    expect(source).toContain(
      'className="mt-3 h-[5.25rem] max-h-[5.25rem] overflow-hidden font-serif text-2xl leading-7"',
    );
    expect(source).toContain("{/* TROIS CARTES CLASSIQUES */}");
    expect(source).toContain("index === rightCards.length - 1");
  });

  it("ne rajoute aucun bloc étranger", () => {
    expect(source).not.toContain("PasDeLaCasaTraffic");
    expect(source).not.toContain("bonASavoir");
  });
});
