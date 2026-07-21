export type ArticleEditorMode = "create" | "update";

export type ArticleSubmissionIntent =
  | "draft"
  | "publish";

export type ArticleContentType =
  | "article"
  | "editorial"
  | "video"
  | "interview"
  | "podcast"
  | "gallery";

export type ArticleChannel =
  | "site"
  | "application"
  | "newsletter"
  | "social";

export type ArticleDraft = {
  id: number | null;

  title: string;
  slug: string;

  category: string;
  author: string;

  description: string;
  content: string;

  image: string;

  contentType: ArticleContentType;

  videoUrl: string;
  videoDuration: string;

  socialText: string;

  featured: boolean;
  published: boolean;

  pageKey: string;
  zone: string;
  priority: number;
  channel: ArticleChannel;

  startsAt: string;
  endsAt: string;

  readingTime: string;
};

export type SaveArticleInput = {
  mode: ArticleEditorMode;
  intent: ArticleSubmissionIntent;
  article: ArticleDraft;
};

export type SaveArticleResult =
  | {
      success: true;
      articleId: number;
      slug: string;
      published: boolean;
      redirectTo: string;
    }
  | {
      success: false;
      message: string;
      field?: keyof ArticleDraft;
    };

export type EditorialZone = {
  value: string;
  label: string;
  description: string;
};

export const EDITORIAL_ZONES: EditorialZone[] = [
  {
    value: "hero",
    label: "À la une principale",
    description:
      "Contenu principal affiché en tête de page.",
  },
  {
    value: "featured",
    label: "Sélection éditoriale",
    description:
      "Contenu mis en avant dans une zone éditoriale.",
  },
  {
    value: "standard",
    label: "Flux standard",
    description:
      "Contenu affiché dans le flux normal de la page.",
  },
  {
    value: "secondary",
    label: "Zone secondaire",
    description:
      "Contenu complémentaire ou de second niveau.",
  },
];

export const EMPTY_ARTICLE_DRAFT: ArticleDraft = {
  id: null,

  title: "",
  slug: "",

  category: "ACTUALITÉ",
  author: "",

  description: "",
  content: "",

  image: "",

  contentType: "article",

  videoUrl: "",
  videoDuration: "",

  socialText: "",

  featured: false,
  published: false,

  pageKey: "home",
  zone: "standard",
  priority: 0,
  channel: "site",

  startsAt: "",
  endsAt: "",

  readingTime: "1 min",
};

export function slugifyArticleTitle(
  value: string
): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function calculateArticleWordCount(
  content: string
): number {
  const normalizedContent = content.trim();

  if (!normalizedContent) {
    return 0;
  }

  return normalizedContent
    .split(/\s+/)
    .filter(Boolean).length;
}

export function calculateArticleReadingTime(
  content: string
): string {
  const wordCount =
    calculateArticleWordCount(content);

  const minutes = Math.max(
    1,
    Math.ceil(wordCount / 200)
  );

  return `${minutes} min`;
}

export function createArticleDraft(
  values?: Partial<ArticleDraft>
): ArticleDraft {
  return {
    ...EMPTY_ARTICLE_DRAFT,
    ...values,
  };
}