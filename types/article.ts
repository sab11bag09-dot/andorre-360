export type Article = {
  id?: string;
  slug?: string;

  type?: "article" | "video" | "interview" | "galerie";
  format?: "une" | "carte" | "breve" | "analyse";
  status?: "draft" | "published";

  title: string;
  category?: string;

  date: string;
  author: string;
  readingTime: string;
  image: string;
  description: string;
  content: string;
};