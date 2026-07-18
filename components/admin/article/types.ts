export type ArticleEditorMode = "create" | "edit";

export type ArticleEditorValues = {
  id?: number;
  title: string;
  slug: string;
  category: string;
  author: string;
  description: string;
  content: string;
  image: string;
  readingTime: string;
  contentType: string;
  videoUrl: string;
  videoDuration: string;
  socialText: string;
  featured: boolean;
  published: boolean;
  pageKey: string;
  channel: string;
  zone: string;
  priority: string;
  startsAt: string;
  endsAt: string;
};

export const CONTENT_TYPES = [
  { value: "article", label: "Article" },
  { value: "editorial", label: "Éditorial" },
  { value: "video", label: "Vidéo" },
  { value: "interview", label: "Interview" },
  { value: "podcast", label: "Podcast" },
  { value: "gallery", label: "Galerie" },
] as const;

export const CATEGORIES = [
  { value: "ACTUALITÉ", label: "Actualité" },
  { value: "ÉCONOMIE", label: "Économie" },
  { value: "SOCIÉTÉ", label: "Société" },
  { value: "CULTURE", label: "Culture" },
  { value: "SPORTS", label: "Sports" },
  { value: "MONTAGNE", label: "Montagne" },
  { value: "ÉDITORIAL", label: "Éditorial" },
] as const;

export const EDITORIAL_PAGES = [
  { value: "home", label: "Page d’accueil" },
  { value: "category:ACTUALITÉ", label: "Rubrique Actualité" },
  { value: "category:ÉCONOMIE", label: "Rubrique Économie" },
  { value: "category:SOCIÉTÉ", label: "Rubrique Société" },
  { value: "category:CULTURE", label: "Rubrique Culture" },
  { value: "category:SPORTS", label: "Rubrique Sports" },
  { value: "category:MONTAGNE", label: "Rubrique Montagne" },
  { value: "category:ÉDITORIAL", label: "Rubrique Éditorial" },
] as const;

export const CHANNELS = [
  { value: "site", label: "Site ANDORRE 360" },
  { value: "facebook", label: "Facebook" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "newsletter", label: "Newsletter" },
] as const;

export const EDITORIAL_ZONES = [
  {
    value: "hero",
    label: "Une principale",
    description: "Le sujet dominant de la page.",
  },
  {
    value: "feature",
    label: "Grande Carte",
    description: "Le grand papier placé sous la Une.",
  },
  {
    value: "brief",
    label: "Brève",
    description: "Une information courte dans L’Essentiel.",
  },
  {
    value: "grand-format",
    label: "Grand Format",
    description: "Un récit long avec une forte présence visuelle.",
  },
  {
    value: "editorial",
    label: "Édito",
    description: "La voix de la rédaction.",
  },
  {
    value: "card",
    label: "Sélection",
    description: "Un article retenu par la rédaction.",
  },
  {
    value: "discover",
    label: "À découvrir",
    description: "Une recommandation pour poursuivre la lecture.",
  },
  {
    value: "standard",
    label: "Article standard",
    description: "Une publication normale dans sa rubrique.",
  },
] as const;

export const EMPTY_ARTICLE_VALUES: ArticleEditorValues = {
  title: "",
  slug: "",
  category: "ACTUALITÉ",
  author: "Salah",
  description: "",
  content: "",
  image: "/images/global/hero.jpg",
  readingTime: "1 min",
  contentType: "article",
  videoUrl: "",
  videoDuration: "",
  socialText: "",
  featured: false,
  published: false,
  pageKey: "home",
  channel: "site",
  zone: "standard",
  priority: "0",
  startsAt: "",
  endsAt: "",
};

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function calculateWordCount(content: string): number {
  const cleanContent = content.trim();

  if (!cleanContent) {
    return 0;
  }

  return cleanContent.split(/\s+/).length;
}

export function calculateReadingTime(content: string): number {
  const wordCount = calculateWordCount(content);

  return Math.max(1, Math.ceil(wordCount / 220));
}
