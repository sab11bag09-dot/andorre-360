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
};