import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const componentSource = readFileSync(
  new URL("./ImmobilierPageV2.tsx", import.meta.url),
  "utf8",
);

const routeSource = readFileSync(
  new URL("../app/(public)/ils-en-parlent/page.tsx", import.meta.url),
  "utf8",
);

function countOccurrences(value: string): number {
  return componentSource.split(value).length - 1;
}

describe("mise en page Ils en parlent", () => {
  it("conserve le composant historique et sa route publique", () => {
    expect(routeSource).toContain(
      'import ImmobilierPageV2 from "@/components/ImmobilierPageV2";',
    );
    expect(routeSource).toContain("<ImmobilierPageV2 showMiddleCards />");
    expect(componentSource).toContain(
      "export default async function ImmobilierPageV2",
    );
  });

  it("conserve la compatibilité des catégories éditoriales", () => {
    expect(componentSource).toContain(
      'getArticlesByCategory("ILS_EN_PARLENT")',
    );
    expect(componentSource).toContain('getArticlesByCategory("IMMOBILIER")');
    expect(componentSource).toContain(
      "const items = [...currentItems, ...legacyItems].sort",
    );
    expect(componentSource).toContain('featured.category === "IMMOBILIER"');
    expect(componentSource).toContain('? "ILS EN PARLENT"');
  });

  it("conserve la répartition éditoriale des articles", () => {
    expect(componentSource).toContain("const rightCards = items.slice(3, 6);");
    expect(componentSource).toContain("const briefs = items.slice(6, 12);");
    expect(componentSource).toContain("const bottomCard = items[12];");
    expect(componentSource).toContain("const secondBottomCard = items[13];");
    expect(componentSource).toContain("const middleCard = items[14];");
    expect(componentSource).toContain("const secondMiddleCard = items[15];");
  });

  it("conserve les dimensions du hero", () => {
    expect(componentSource).toContain(
      'className="relative h-[60vh] min-h-[480px] overflow-hidden"',
    );
    expect(componentSource).toContain(
      'className="mt-4 h-[7rem] max-h-[7rem] overflow-hidden font-serif text-4xl leading-[1.15] md:text-5xl"',
    );
    expect(componentSource).toContain(
      'className="mt-4 line-clamp-2 text-gray-300"',
    );
  });

  it("conserve la vidéo et les limites de l’article principal", () => {
    expect(componentSource).toContain(
      'import MediaPreview from "@/components/article/MediaPreview";',
    );
    expect(componentSource).toContain("videoUrl={mainArticle.videoUrl}");
    expect(componentSource).toContain('className="relative h-[420px]"');
    expect(componentSource).toContain(
      'className="line-clamp-2 font-serif text-4xl leading-[1.05]"',
    );
    expect(componentSource).toContain(
      'className="mt-4 line-clamp-2 text-gray-400"',
    );
  });

  it("conserve six brèves limitées à trois lignes", () => {
    expect(componentSource).toContain("{/* SIX BRÈVES */}");
    expect(componentSource).toContain(
      'className="mt-8 grid gap-4 md:grid-cols-3"',
    );
    expect(componentSource).toContain(
      'className="line-clamp-3 font-serif text-lg leading-snug"',
    );
  });

  it("conserve les deux cartes intermédiaires optionnelles", () => {
    expect(componentSource).toContain(
      "showMiddleCards && (middleCard || secondMiddleCard)",
    );
    expect(componentSource).toContain("[middleCard, secondMiddleCard]");
    expect(
      countOccurrences(
        'className="h-[220px] max-h-[220px] overflow-hidden rounded-xl',
      ),
    ).toBe(1);
  });

  it("conserve les deux cartes de pied", () => {
    expect(componentSource).toContain(
      "{/* DEUX PAPIERS DE PIED SUR LES 4 COLONNES */}",
    );
    expect(countOccurrences('className="relative h-64"')).toBe(2);
    expect(componentSource).toContain("{bottomCard.description}");
    expect(componentSource).toContain("{secondBottomCard.description}");
  });

  it("conserve Question à et les trois cartes classiques", () => {
    expect(componentSource).toContain("{/* QUESTION À... */}");
    expect(componentSource).toContain('className="relative h-72"');
    expect(componentSource).toContain(
      'className="mt-3 line-clamp-3 font-serif text-2xl leading-snug"',
    );
    expect(componentSource).toContain("{/* TROIS CARTES CLASSIQUES */}");
    expect(componentSource).toContain("rightCards.map((article, index) =>");
  });
});
