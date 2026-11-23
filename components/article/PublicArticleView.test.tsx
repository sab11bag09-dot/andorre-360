import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import PublicArticleView, { type PublicArticleViewData } from "./PublicArticleView";

const ARTICLE: PublicArticleViewData = {
  title: "Le Govern présente son plan logement",
  description: "Chapô.",
  content: "Premier paragraphe.",
  category: "SOCIÉTÉ",
  image: "/api/media/files/sources/p.jpg",
  author: "Rédaction ANDORRE 360",
  readingTime: "2 min",
  videoUrl: null,
  publishedAt: new Date("2026-11-20T10:00:00.000Z"),
};

describe("PublicArticleView — crédit de la photo", () => {
  it("crédite la photo sous l’image, dans la langue de l’article", () => {
    const french = renderToStaticMarkup(
      <PublicArticleView article={{ ...ARTICLE, imageCredit: "Govern d’Andorra" }} dateLocale="fr-FR" contentLanguage="fr" />,
    );
    const catalan = renderToStaticMarkup(
      <PublicArticleView article={{ ...ARTICLE, imageCredit: "Govern d’Andorra" }} dateLocale="ca-ES" contentLanguage="ca" />,
    );

    expect(french).toContain("Photo : Govern d’Andorra");
    expect(catalan).toContain("Foto: Govern d’Andorra");
  });

  it("n’affiche aucun crédit pour une image sans crédit", () => {
    const html = renderToStaticMarkup(
      <PublicArticleView article={ARTICLE} dateLocale="fr-FR" contentLanguage="fr" />,
    );

    expect(html).not.toContain("Photo :");
  });
});

describe("PublicArticleView — mention de la source et mots fixes", () => {
  const credits = [
    { name: "Govern d’Andorra", url: "https://www.govern.ad/a" },
    { name: "CASS", url: null },
  ];

  function render(contentLanguage: "fr" | "ca" | "es") {
    const dateLocale = ({ fr: "fr-FR", ca: "ca-ES", es: "es-ES" } as const)[contentLanguage];
    return renderToStaticMarkup(
      <PublicArticleView article={{ ...ARTICLE, sourceCredits: credits }} dateLocale={dateLocale} contentLanguage={contentLanguage} />,
    ).replace(/<!-- -->/g, "");
  }

  it("indique « D’après… » sous le titre, avec un lien vers l’article d’origine", () => {
    const html = render("fr");
    expect(html).toContain("• D’après<span> <a");
    expect(html).toContain('href="https://www.govern.ad/a"');
    expect(html).toMatch(/Govern d’Andorra<\/a><\/span><span> et CASS/);
    expect(html.indexOf("D’après")).toBeLessThan(html.indexOf("Premier paragraphe."));
  });

  it("écrit la mention et les mots fixes dans la langue de l’article", () => {
    const catalan = render("ca");
    expect(catalan).toContain("Segons");
    expect(catalan).toContain(" i CASS");
    expect(catalan).toContain("Per Rédaction");
    expect(catalan).toContain("TEMPS DE LECTURA:");
    expect(catalan).toContain("Article signat");
    expect(catalan).not.toContain("Article signé");

    const spanish = render("es");
    expect(spanish).toContain("Según");
    expect(spanish).toContain(" y CASS");
    expect(spanish).toContain("TIEMPO DE LECTURA:");
    expect(spanish).toContain("Artículo firmado");
  });

  it("n’affiche pas de mention sans source", () => {
    expect(renderToStaticMarkup(<PublicArticleView article={ARTICLE} dateLocale="fr-FR" contentLanguage="fr" />)).not.toContain("D’après");
  });
});
