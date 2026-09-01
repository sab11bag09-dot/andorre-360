import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const source = readFileSync(
  new URL("./MontagnePageV2.tsx", import.meta.url),
  "utf8",
);

describe("mise en page Montagne", () => {
  it("conserve la répartition des articles", () => {
    expect(source).toContain(
      'const items = await getArticlesByCategory("MONTAGNE");',
    );
    expect(source).toContain("const rightCards = items.slice(3, 6);");
    expect(source).toContain("const briefs = items.slice(6, 12);");
  });

  it("conserve le hero actuel", () => {
    expect(source).toContain(
      'className="relative h-[60vh] min-h-[480px] overflow-hidden"',
    );
    expect(source).toContain(
      'className="mt-4 h-[7rem] max-h-[7rem] overflow-hidden font-serif text-4xl leading-[1.15] md:text-5xl"',
    );
    expect(source).toContain('className="mt-4 line-clamp-2 text-gray-300"');
  });

  it("conserve la vidéo de l’article principal", () => {
    expect(source).toContain(
      'import MediaPreview from "@/components/article/MediaPreview";',
    );
    expect(source).toContain("videoUrl={mainArticle.videoUrl}");
    expect(source).toContain('mode="featured"');
  });

  it("conserve deux cartes texte puis quatre cartes illustrées", () => {
    expect(source).toContain(
      "{/* BLOC INFÉRIEUR : 2 CARTES SANS PHOTO + 4 CARTES AVEC PHOTO */}",
    );
    expect(source).toContain("index >= 2 && article.image");
    expect(source).toContain('className="relative h-64 flex-none"');
  });

  it("conserve les six cartes inférieures étirées uniformément", () => {
    expect(source).toContain(
      'className="mt-8 grid gap-6 md:grid-cols-2 lg:flex-1"',
    );
    expect(source).toContain('className="block lg:h-full"');
    expect(source).toContain(
      'className="flex h-full min-h-[240px] flex-col overflow-hidden',
    );
  });

  it("conserve Question à et les trois cartes latérales", () => {
    expect(source).toContain("{/* QUESTION À... */}");
    expect(source).toContain("{/* TROIS CARTES CLASSIQUES */}");
    expect(source).toContain("index === rightCards.length - 1");
  });

  it("ne rajoute aucun bloc étranger à la page", () => {
    expect(source).not.toContain("PasDeLaCasaTraffic");
    expect(source).not.toContain("bonASavoir");
    expect(source).not.toContain("bottomCards");
  });
});
