import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const pageSource = readFileSync(
  new URL("./LifestylePageV2.tsx", import.meta.url),
  "utf8",
);

const trafficSource = readFileSync(
  new URL("./PasDeLaCasaTraffic.tsx", import.meta.url),
  "utf8",
);

describe("mise en page Loisirs", () => {
  it("utilise les placements Loisirs puis les articles Montagne", () => {
    expect(pageSource).toContain('buildEditorialLayout("category:LOISIRS")');
    expect(pageSource).toContain('getArticlesByCategory("MONTAGNE")');
    expect(pageSource).not.toContain('getArticlesByCategory("LIFESTYLE")');
  });

  it("évite de répéter un article", () => {
    expect(pageSource).toContain("const usedArticleIds = new Set<number>();");
    expect(pageSource).toContain("usedArticleIds.has(preferred.id)");
    expect(pageSource).not.toContain("items[15] ?? items[0]");
    expect(pageSource).not.toContain("items[16] ?? items[1]");
  });

  it("respecte les zones éditoriales", () => {
    expect(pageSource).toContain("const featured = takeArticle(layout.hero);");
    expect(pageSource).toContain(
      "const mainArticle = takeArticle(layout.feature);",
    );
    expect(pageSource).toContain(
      "const questionArticle = takeArticle(layout.question);",
    );
    expect(pageSource).toContain(
      "const rightCards = takeArticles(layout.card, 3);",
    );
    expect(pageSource).toContain(
      "const briefs = takeArticles(layout.briefs, 6);",
    );
    expect(pageSource).toContain("layout.grandFormat");
  });

  it("conserve le module trafic sous le hero", () => {
    expect(pageSource).toContain(
      'import PasDeLaCasaTraffic from "@/components/PasDeLaCasaTraffic";',
    );
    expect(pageSource).toContain("<PasDeLaCasaTraffic />");
  });

  it("conserve les sources officielles du trafic", () => {
    expect(trafficSource).toContain("https://www.mobilitat.ad/");
    expect(trafficSource).toContain(
      "https://www.bison-fute.gouv.fr/rn-20.html",
    );
    expect(trafficSource).toContain(
      "https://www.mobilitat.ad/totes-les-cameres",
    );
    expect(trafficSource).toContain("Source officielle");
  });

  it("conserve les vidéos dans l’article principal", () => {
    expect(pageSource).toContain(
      'import MediaPreview from "@/components/article/MediaPreview";',
    );
    expect(pageSource).toContain("videoUrl={mainArticle.videoUrl}");
  });
});
