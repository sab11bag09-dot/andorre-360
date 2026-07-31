export type SiteRule = {
  listing?: string[];
  content: string[];
  remove?: string[];
};

export const siteRules: Record<string, SiteRule> = {
  "www.altaveu.com": {
  listing: ["h2 a"],
  content: [
    ".c-mainarticle__body",
  ],
},

  "www.diariandorra.ad": {
  listing: ["h2 a"],
  content: [
    ".c-detail__body",
  ],
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
  content: [
    ".article-body",
  ],
    remove: [
      ".google-auto-placed",
      ".ap_container",
    ],
    },
"www.rtva.ad": {
  listing: [
    'a[href^="/noticies/"]',
  ],
  content: [
    '[class^="ContentArticle_infoBody"]',
  ],
},
"www.laveulliure.ad": {
  listing: [
    'a[href^="/ca/article/"]',
  ],
  content: [
    ".field--name-body",
  ],
},
"elperiodic.ad": {
  listing: [
    ".e-loop-item .elementor-heading-title a",
  ],
  content: [
    ".elementor-widget-theme-post-content",
  ],
},
"www.govern.ad": {
  listing: [
    ".journal-content-article h3 a",
  ],

  content: [
    ".component-html",
  ],

  remove: [
    ".share",
    ".social",
    ".related",
  ],
},
"www.consellgeneral.ad": {
  listing: [
    ".noticiesDestacades .titleItem a",
  ],

  content: [
    "#parent-fieldname-text",
  ],
},
};
