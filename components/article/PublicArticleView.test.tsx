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
