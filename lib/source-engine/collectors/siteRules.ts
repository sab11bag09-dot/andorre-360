export type SiteRule = {
  listing?: string[];
  title?: string[];
  content: string[];
  remove?: string[];
  articlePathPattern?: RegExp;
  maxArticles?: number;
  concurrency?: number;
  requireContent?: boolean;
};

const comuEncampRule: SiteRule = {
  listing: [".newsItem2__title a.newsItem2__link"],
  articlePathPattern: /^\/actualitat\/noticies\/[^/]+\/?$/,
  maxArticles: 24,
  concurrency: 4,
  requireContent: true,
  content: ["#parent-fieldname-text"],
  remove: [
    "#content-core > time",
    "#content-core > figure",
    ".documentByLine",
    "script",
    "style",
  ],
};

export const siteRules: Record<string, SiteRule> = {
  "www.altaveu.com": {
    listing: ['a[href*="/actualitat/"]'],
    articlePathPattern:
      /^\/actualitat\/[^/]+\/[^/]+_\d+_\d+\.html$/,
    maxArticles: 24,
    concurrency: 4,
    content: [".c-mainarticle__body"],
  },

  "www.diariandorra.ad": {
    listing: ["h2 a"],
    maxArticles: 24,
    concurrency: 4,
    requireContent: true,
    content: [".c-detail__body"],
    remove: [
      ".c-detail__author",
      ".c-detail__tags-content",
      ".c-detail__related",
      ".c-detail__recommended",
      ".henneoHB_desktop",
      ".c-add",
    ],
  },

  "www.bondia.ad": {
    listing: ["h2 a"],
    content: [".article-body"],
    remove: [".google-auto-placed", ".ap_container"],
  },

  "www.rtva.ad": {
    listing: ['a[href^="/noticies/"]'],
    articlePathPattern: /^\/noticies\/[^/]+\/[^/]+\/?$/,
    maxArticles: 24,
    concurrency: 4,
    content: ['[class^="ContentArticle_infoBody"]'],
  },

  "www.laveulliure.ad": {
    listing: ['a[href^="/ca/article/"]'],
    articlePathPattern: /^\/ca\/article\/[^/]+\/?$/,
    maxArticles: 24,
    concurrency: 4,
    content: [".content__body .field--name-body"],
  },

  "elperiodic.ad": {
    listing: [".e-loop-item .elementor-heading-title a"],
    articlePathPattern: /^\/[^/]+\/[^/]+\/?$/,
    maxArticles: 24,
    concurrency: 4,
    requireContent: true,
    content: [".elementor-widget-theme-post-content"],
  },

  "www.andorralavella.ad": {
    listing: ['h2 a[href*="q=noticia/"]'],
    maxArticles: 24,
    concurrency: 4,
    requireContent: true,
    content: [".field-name-body .field-item"],
    remove: [".addtoany_list", "script", "style"],
  },

  "www.govern.ad": {
    listing: [".journal-content-article h3 a"],
    articlePathPattern: /^\/ca\/w\/[^/]+\/?$/,
    maxArticles: 24,
    concurrency: 4,
    requireContent: true,
    content: [".component-html"],
    remove: [".share", ".social", ".related"],
  },

  "www.consellgeneral.ad": {
    listing: [".noticiesDestacades .titleItem a"],
    content: ["#parent-fieldname-text"],
  },

  "andorraara.com": {
    listing: [".uael-post__title a"],
    content: [
      ".elementor-widget-text-editor .page .layoutArea .column",
    ],
    remove: [
      ".sharedaddy",
      ".social-share",
      ".post-tags",
      ".comments-area",
    ],
  },

  "canillo.ad": {
    listing: [".item-noticia a.btn-fletxa.stretched-link"],
    title: [".item-noticia .titol", ".item-noticia h2", ".item-noticia h3", ".item-noticia .field--name-title", "h2", "h3"],
    content: [".field--name-field-content .field__item"],
    remove: [
      ".field--name-field-galeria-noticia",
      ".layout__region--second",
    ],
  },

  "www.canillo.ad": {
    listing: [".item-noticia a.btn-fletxa.stretched-link"],
    title: [".item-noticia .titol", ".item-noticia h2", ".item-noticia h3", ".item-noticia .field--name-title", "h2", "h3"],
    content: [".field--name-field-content .field__item"],
    remove: [".field--name-field-galeria-noticia", ".layout__region--second"],
  },

  "www.policia.ad": {
    listing: ['a[href*="/ca/noticies/noticies/"]'],
    articlePathPattern:
      /^\/ca\/noticies\/noticies\/\d{4}\/\d{2}\/\d{2}\/\d+\/[^/]+\/?$/,
    maxArticles: 24,
    concurrency: 4,
    requireContent: true,
    content: [".post_body"],
    remove: [
      ".share",
      ".social",
      ".related",
      ".sidebar",
      "script",
      "style",
    ],
  },

  "www.fcandorra.com": {
    listing: ['a[href^="/es/noticias/"]'],
    articlePathPattern: /^\/es\/noticias\/[^/]+\/?$/,
    maxArticles: 24,
    concurrency: 4,
    requireContent: true,
    content: [
  ".MkContentBlocks__richText",
  ".MkRickText",
  ".MkContentBlocks",
  ".article-content",
  ".content-noticia",
  ".entry-content",
  "main",
],
    remove: [
      ".cookie",
      ".cookies",
      '[class*="cookie"]',
      '[id*="cookie"]',
      ".share",
      ".social",
      ".related",
      "script",
      "style",
    ],
  },
  "www.faciclisme.com": {
    listing: ['a[href^="/ca/noticies/"][href$="/"]'],
    articlePathPattern:
      /^\/ca\/noticies\/[^/]+\/\d{4}\/\d{2}\/\d+\/\d+\/[^/]+\/?$/,
    maxArticles: 24,
    concurrency: 4,
    requireContent: true,
    content: ["div.m-b-40"],
    remove: ["header", "footer", "nav", "script", "style"],
  },

  "faciclisme.com": {
    listing: ['a[href^="/ca/noticies/"][href$="/"]'],
    articlePathPattern:
      /^\/ca\/noticies\/[^/]+\/\d{4}\/\d{2}\/\d+\/\d+\/[^/]+\/?$/,
    maxArticles: 24,
    concurrency: 4,
    requireContent: true,
    content: ["div.m-b-40"],
    remove: ["header", "footer", "nav", "script", "style"],
  },
    "www.feda.ad": {
    listing: [".newsItem__title"],
    articlePathPattern:
      /^\/feda-comunica\/sala-de-premsa\/notes-de-premsa\/[^/]+\/?$/,
    maxArticles: 24,
    concurrency: 4,
    requireContent: true,
    content: ["#content-core"],
    remove: [
      ".newsItem__date",
      ".documentActions",
      "script",
      "style",
    ],
  },
    "www.who.int": {
    listing: ['a.link-container[href^="/europe/news/item/"]'],
    articlePathPattern:
      /^\/europe\/news\/item\/[^/]+\/?$/,
    maxArticles: 24,
    concurrency: 4,
    requireContent: true,
    content: [".sf-detail-body-wrapper"],
    remove: [
      "header",
      "footer",
      "nav",
      "script",
      "style",
      ".share",
    ],
  },
    "www.grandvalira.com": {
    listing: ["a.card__link"],
    articlePathPattern:
      /^\/fr\/(?:noticies|actualites)\/[^/]+\/?$/,
    maxArticles: 24,
    concurrency: 4,
    requireContent: true,
    content: [".article__content.free-text"],
    remove: [
      "header",
      "footer",
      "nav",
      "script",
      "style",
      ".share",
    ],
  },
    "www.palarinsal.com": {
    listing: [
      'a[href*="/noticies/"]',
      'a[href*="/actualites/"]',
      'a[href*="/noticias/"]',
      'a[href*="/news/"]',
    ],
    articlePathPattern:
      /^\/(?:ca\/noticies|fr\/actualites|es\/noticias|en\/news)\/[^/]+\/?$/,
    maxArticles: 24,
    concurrency: 4,
    requireContent: true,
    content: [".article__content.free-text"],
    remove: [
      "header",
      "footer",
      "nav",
      "script",
      "style",
      ".share",
    ],
  },

  "palarinsal.com": {
    listing: [
      'a[href*="/noticies/"]',
      'a[href*="/actualites/"]',
      'a[href*="/noticias/"]',
      'a[href*="/news/"]',
    ],
    articlePathPattern:
      /^\/(?:ca\/noticies|fr\/actualites|es\/noticias|en\/news)\/[^/]+\/?$/,
    maxArticles: 24,
    concurrency: 4,
    requireContent: true,
    content: [".article__content.free-text"],
    remove: [
      "header",
      "footer",
      "nav",
      "script",
      "style",
      ".share",
    ],
  },
    "concordia.ad": {
    listing: [
      'h4.entry-title a[href^="https://concordia.ad/"]',
      'h4.entry-title a[href^="https://www.concordia.ad/"]',
      'article h4 a[href*="concordia.ad/"]',
      'h4 a[href*="concordia.ad/"]',
    ],
    articlePathPattern: /^\/[^/]+\/?$/,
    maxArticles: 24,
    concurrency: 4,
    requireContent: true,
    content: [".mkdf-post-content", ".entry-content", ".article-content"],
    remove: [
      "header",
      "footer",
      "nav",
      "script",
      "style",
      ".share",
    ],
  },

  "www.concordia.ad": {
    listing: [
      'h4.entry-title a[href^="https://concordia.ad/"]',
      'h4.entry-title a[href^="https://www.concordia.ad/"]',
      'article h4 a[href*="concordia.ad/"]',
      'h4 a[href*="concordia.ad/"]',
    ],
    articlePathPattern: /^\/[^/]+\/?$/,
    maxArticles: 24,
    concurrency: 4,
    requireContent: true,
    content: [".mkdf-post-content", ".entry-content", ".article-content"],
    remove: [
      "header",
      "footer",
      "nav",
      "script",
      "style",
      ".share",
    ],
  },
    "comusantjulia.ad": {
    listing: ['a[href*="/ca/actualitat/noticies/"]'],
    articlePathPattern:
      /^\/ca\/actualitat\/noticies\/[^/]+\/?$/,
    maxArticles: 24,
    concurrency: 4,
    requireContent: true,
    content: [".post-content"],
    remove: [
      "header",
      "footer",
      "nav",
      "script",
      "style",
      ".share",
    ],
  },

  "santjulia.ad": {
    listing: ['a[href*="/ca/actualitat/noticies/"]'],
    articlePathPattern:
      /^\/ca\/actualitat\/noticies\/[^/]+\/?$/,
    maxArticles: 24,
    concurrency: 4,
    requireContent: true,
    content: [".post-content"],
    remove: [
      "header",
      "footer",
      "nav",
      "script",
      "style",
      ".share",
    ],
  },

  "www.santjulia.ad": {
    listing: ['a[href*="/ca/actualitat/noticies/"]'],
    articlePathPattern:
      /^\/ca\/actualitat\/noticies\/[^/]+\/?$/,
    maxArticles: 24,
    concurrency: 4,
    requireContent: true,
    content: [".post-content"],
    remove: [
      "header",
      "footer",
      "nav",
      "script",
      "style",
      ".share",
    ],
  },
    "www.agenda.ad": {
    listing: ['a[href*="/activitat/"]'],
    maxArticles: 24,
    concurrency: 4,
    requireContent: true,
    content: ["#activitat__contingut", "main"],
    remove: [
      "header",
      "footer",
      "nav",
      "script",
      "style",
      "#activitat__altres",
    ],
  },

  "agenda.ad": {
    listing: ['a[href*="/activitat/"]'],
    maxArticles: 24,
    concurrency: 4,
    requireContent: true,
    content: ["#activitat__contingut", "main"],
    remove: [
      "header",
      "footer",
      "nav",
      "script",
      "style",
      "#activitat__altres",
    ],
  },
    "www.afa.ad": {
    listing: ['a[href*="/comunicats-de-premsa/"]'],
    maxArticles: 24,
    concurrency: 4,
    requireContent: true,
    content: ["#content-core"],
    remove: [
      "header",
      "footer",
      "nav",
      "script",
      "style",
      ".share",
    ],
  },
    "www.ccis.ad": {
    listing: [
      '.entry-title a[href^="https://www.ccis.ad/"]',
    ],
    articlePathPattern: /^\/[^/]+\/?$/,
    maxArticles: 24,
    concurrency: 4,
    requireContent: true,
    content: [".entry-content.post-content"],
    remove: [
      ".post-title",
      ".post-meta",
      ".post-read-more",
      ".socials-sharing",
      "script",
      "style",
    ],
  },
    "www.ordino.ad": {
    listing: ['a[href*="/news/"]'],
    articlePathPattern:
      /^\/news\/[^/]+\/?$/,
    maxArticles: 24,
    concurrency: 4,
    requireContent: true,
    content: ["main"],
    remove: [
      "header",
      "footer",
      "nav",
      "script",
      "style",
      ".cookie",
    ],
  },
    "www.cass.ad": {
    listing: ['a[href^="/noticies/"]'],
    articlePathPattern:
      /^\/noticies\/[^/]+\/?$/,
    maxArticles: 24,
    concurrency: 4,
    requireContent: true,
    content: [".node__content"],
    remove: [
      "header",
      "footer",
      "nav",
      "script",
      "style",
      ".share",
    ],
  },

  "cass.ad": {
    listing: ['a[href^="/noticies/"]'],
    articlePathPattern:
      /^\/noticies\/[^/]+\/?$/,
    maxArticles: 24,
    concurrency: 4,
    requireContent: true,
    content: [".node__content"],
    remove: [
      "header",
      "footer",
      "nav",
      "script",
      "style",
      ".share",
    ],
  },
    "www.coa.ad": {
    listing: ['h2.entry-title a'],
    articlePathPattern:
      /^\/(?!noticies\/?$)[^/]+\/?$/,
    maxArticles: 24,
    concurrency: 4,
    requireContent: true,
    content: [".entry-content"],
    remove: [
      "header",
      "footer",
      "nav",
      "script",
      "style",
      ".share",
    ],
  },
    "creuroja.ad": {
    listing: ['a[href*="creuroja.ad/"]'],
    articlePathPattern: /^\/[^/]+\/?$/,
    maxArticles: 24,
    concurrency: 4,
    requireContent: true,
    content: [".elementor-widget-text-editor"],
    remove: [
      "header",
      "footer",
      "nav",
      "script",
      "style",
      ".share",
    ],
  },

  "www.creuroja.ad": {
    listing: ['a[href*="creuroja.ad/"]'],
    articlePathPattern: /^\/[^/]+\/?$/,
    maxArticles: 24,
    concurrency: 4,
    requireContent: true,
    content: [".elementor-widget-text-editor"],
    remove: [
      "header",
      "footer",
      "nav",
      "script",
      "style",
      ".share",
    ],
  },
    "www.psa.ad": {
    listing: ['a[href*="/actualitat/noticies/"]'],
    articlePathPattern:
      /^\/actualitat\/noticies\/[^/]+\/?$/,
    maxArticles: 24,
    concurrency: 4,
    requireContent: true,
    content: ["#content-core"],
    remove: [
      "header",
      "footer",
      "nav",
      "script",
      "style",
      ".share",
    ],
  },
    "www.tribunalconstitucional.ad": {
    listing: ['a[href*="/causa/"]'],
    articlePathPattern: /^\/causa\/[^/]+\/?$/,
    maxArticles: 24,
    concurrency: 4,
    requireContent: true,
    content: [
      ".field--name-field-contingut",
      ".node__content",
    ],
    remove: [
      "header",
      "footer",
      "nav",
      "script",
      "style",
      ".share",
    ],
  },

  "tribunalconstitucional.ad": {
    listing: ['a[href*="/causa/"]'],
    articlePathPattern: /^\/causa\/[^/]+\/?$/,
    maxArticles: 24,
    concurrency: 4,
    requireContent: true,
    content: [
      ".field--name-field-contingut",
      ".node__content",
    ],
    remove: [
      "header",
      "footer",
      "nav",
      "script",
      "style",
      ".share",
    ],
  },
  
  "comuencamp.ad": comuEncampRule,
    "www.fae.ad": {
    listing: ["h4.post_title.entry-title a"],
    articlePathPattern: /^\/[^/]+\/?$/,
    maxArticles: 24,
    concurrency: 4,
    requireContent: true,
    content: [".elementor-widget-theme-post-content"],
    remove: [
      "header",
      "footer",
      "nav",
      "script",
      "style",
      ".post_info",
    ],
  },
  "www.comuencamp.ad": comuEncampRule,

  "www.ordinoarcalis.com": {
    listing: ['a[href*="/noticies/"], a[href*="/actualites/"], a[href*="/noticias/"], a[href*="/news/"]'],
    articlePathPattern: /^\/(?:ca\/noticies|fr\/actualites|es\/noticias|en\/news)\/[^/]+\/?$/,
    maxArticles: 24,
    concurrency: 4,
    requireContent: true,
    content: [".article__content.free-text"],
    remove: ["header", "footer", "nav", "script", "style", ".share"],
  },
  "ordinoarcalis.com": {
    listing: ['a[href*="/noticies/"], a[href*="/actualites/"], a[href*="/noticias/"], a[href*="/news/"]'],
    articlePathPattern: /^\/(?:ca\/noticies|fr\/actualites|es\/noticias|en\/news)\/[^/]+\/?$/,
    maxArticles: 24,
    concurrency: 4,
    requireContent: true,
    content: [".article__content.free-text"],
    remove: ["header", "footer", "nav", "script", "style", ".share"],
  },

  "www.bca.ad": {
    listing: [
      'a[href^="https://www.bca.ad/"]',
      'a[href^="/"][href$="/"]',
      "article h2 a",
      "article h3 a",
      "h2 a",
      "h3 a",
    ],
    title: [
      "h1",
      ".entry-title",
      ".post-title",
      "article h2",
      "article h3",
    ],
    articlePathPattern:
      /^\/(?!category\/|tag\/|page\/|wp-)[^/]+\/?$/,
    maxArticles: 24,
    concurrency: 4,
    requireContent: true,
    content: [
      "#eut-single-content .eut-container",
      "#eut-single-content",
      ".entry-content",
      ".post-content",
      ".article-content",
      "article",
      "main",
    ],
    remove: [
      "header",
      "footer",
      "nav",
      "script",
      "style",
      ".share",
      ".social",
      ".related",
      ".cookie",
    ],
  },


  "www.faf.ad": {
    listing: ['a[href*="/pnfg/NNws_ShwNewDup?"]'],
    articlePathPattern: /^\/pnfg\/NNws_ShwNewDup$/,
    maxArticles: 24,
    concurrency: 4,
    requireContent: true,
    title: ["h1"],
    content: ["main .container", "main", ".container"],
    remove: ["header", "footer", "nav", "script", "style"],
  },


  "www.ari.ad": {
    listing: ['a[href*="/noticies/"]'],
    articlePathPattern: /^\/noticies\/[^/]+\/?$/,
    maxArticles: 24,
    concurrency: 4,
    requireContent: true,
    title: [".page-title", "h1"],
    content: [".single-post .textlarge.pt-4", ".textlarge.pt-4"],
    remove: ["header", "footer", "nav", "script", "style", ".post-meta"],
  },

};
