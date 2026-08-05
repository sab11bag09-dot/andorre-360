export type SiteRule = {
  listing?: string[];
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
    content: [".field--name-field-content .field__item"],
    remove: [
      ".field--name-field-galeria-noticia",
      ".layout__region--second",
    ],
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

  "comuencamp.ad": comuEncampRule,
  "www.comuencamp.ad": comuEncampRule,
  "www.coa.ad": {
    listing: ['a[href^="https://www.coa.ad/"][href*="/"]'],
    articlePathPattern: /^\/(?!noticies\/?$)[^/]+\/?$/,
    maxArticles: 24,
    concurrency: 4,
    requireContent: true,
    content: [".entry-content"],
    remove: ["header", "footer", "nav", "script", "style", ".share"],
  },

};
