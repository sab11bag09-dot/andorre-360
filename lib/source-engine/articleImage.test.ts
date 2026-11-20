import * as cheerio from "cheerio";
import { describe, expect, it } from "vitest";

import { extractArticleImage, extractRightsNotice, extractRssItemImage } from "./articleImage";

const PAGE = "https://www.govern.ad/ca/w/article";

function image(head: string, body = "") {
  return extractArticleImage(cheerio.load(`<html><head>${head}</head><body>${body}</body></html>`), PAGE);
}

describe("extractArticleImage", () => {
  it("lit l’image de partage déclarée par l’article", () => {
    expect(image('<meta property="og:image" content="https://cdn.govern.ad/photo.jpg">')).toBe(
      "https://cdn.govern.ad/photo.jpg",
    );
  });

  it("résout une adresse relative par rapport à la page", () => {
    expect(image('<meta property="og:image" content="/media/photo.jpg">')).toBe(
      "https://www.govern.ad/media/photo.jpg",
    );
  });

  it("se rabat sur Twitter, puis sur le JSON-LD de l’article", () => {
    expect(image('<meta name="twitter:image" content="https://x.ad/t.jpg">')).toBe("https://x.ad/t.jpg");
    expect(
      image(
        '<script type="application/ld+json">{"@type":"NewsArticle","image":[{"url":"https://x.ad/ld.jpg"}]}</script>',
      ),
    ).toBe("https://x.ad/ld.jpg");
  });

  it("écarte les logos, icônes et images non publiables", () => {
    expect(image('<meta property="og:image" content="https://x.ad/img/logo-govern.png">')).toBeNull();
    expect(image('<meta property="og:image" content="https://x.ad/favicon.ico">')).toBeNull();
    expect(image('<meta property="og:image" content="https://x.ad/dessin.svg">')).toBeNull();
    expect(image('<meta property="og:image" content="data:image/png;base64,AAAA">')).toBeNull();
    expect(image('<meta property="og:image" content="ftp://x.ad/photo.jpg">')).toBeNull();
  });

  it("garde une photo rangée dans un dossier « default »", () => {
    for (const url of [
      "https://laveulliure.ad/sites/default/files/styles/caribe_16x9_1200/public/2026-11/pelea.png.jpeg.webp?itok=z1",
      "https://cdn.who.int/media/images/librariesprovider2/default-album/news-images/photo-1200v.jpg",
    ]) {
      expect(image(`<meta property="og:image" content="${url}">`)).toBe(url);
    }

    expect(image('<meta property="og:image" content="https://www.lamassana.ad/Images/default.jpg">')).toBeNull();
  });

  it("passe à l’image suivante quand la première est un logo", () => {
    expect(
      image(
        '<meta property="og:image" content="https://x.ad/logo.png"><meta name="twitter:image" content="https://x.ad/vraie-photo.jpg">',
      ),
    ).toBe("https://x.ad/vraie-photo.jpg");
  });

  it("renvoie null sans image déclarée", () => {
    expect(image("<title>Sans image</title>")).toBeNull();
  });
});

describe("extractRightsNotice", () => {
  it("lit la mention de droits déclarée dans l’en-tête", () => {
    expect(
      extractRightsNotice(cheerio.load('<head><meta name="copyright" content="Govern d’Andorra"></head>')),
    ).toBe("Govern d’Andorra");
  });

  it("relève la mention du pied de page, même en catalan ou en français", () => {
    expect(
      extractRightsNotice(
        cheerio.load("<body><footer><p>© 2026 FEDA. Tots els drets reservats.</p></footer></body>"),
      ),
    ).toBe("© 2026 FEDA. Tots els drets reservats.");
    expect(
      extractRightsNotice(cheerio.load("<body><footer>Grandvalira — Tous droits réservés</footer></body>")),
    ).toBe("Grandvalira — Tous droits réservés");
  });

  it("raccourcit une mention trop longue et renvoie null sans mention", () => {
    const long = `© ${"Comú ".repeat(60)}`;
    expect(extractRightsNotice(cheerio.load(`<footer>${long}</footer>`))?.length).toBeLessThanOrEqual(160);
    expect(extractRightsNotice(cheerio.load("<footer>Contact</footer>"))).toBeNull();
  });
});

describe("extractRssItemImage", () => {
  const FEED = "https://www.altaveu.com/rss";

  it("lit l’image jointe à l’élément du flux", () => {
    expect(extractRssItemImage({ enclosure: { "@_url": "https://x.ad/e.jpg", "@_type": "image/jpeg" } }, FEED)).toBe(
      "https://x.ad/e.jpg",
    );
    expect(extractRssItemImage({ content: { "@_url": "https://x.ad/m.jpg", "@_medium": "image" } }, FEED)).toBe(
      "https://x.ad/m.jpg",
    );
    expect(extractRssItemImage({ thumbnail: { "@_url": "/t.jpg" } }, FEED)).toBe("https://www.altaveu.com/t.jpg");
  });

  it("ignore une pièce jointe qui n’est pas une image", () => {
    expect(
      extractRssItemImage({ enclosure: { "@_url": "https://x.ad/podcast.mp3", "@_type": "audio/mpeg" } }, FEED),
    ).toBeNull();
    expect(extractRssItemImage({ title: "Sans image" }, FEED)).toBeNull();
  });
});
