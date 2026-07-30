export type SiteRule = {
  content: string[];
  remove: string[];
};

export const siteRules: Record<string, SiteRule> = {
  "www.altaveu.com": {
    content: [
      ".c-mainarticle__body",
    ],
    remove: [],
  },

  "www.diariandorra.ad": {
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
    content: [
      ".article-body",
    ],
    remove: [
      ".google-auto-placed",
      ".ap_container",
    ],
  },
};