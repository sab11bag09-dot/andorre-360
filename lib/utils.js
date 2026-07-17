export function slugify(text) {
  return text
    .toString()
    .normalize("NFD") // enlève accents
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function enrichArticle(article) {
  const slug = slugify(article.title);

  return {
    id: slug,
    slug: slug,
    type: "article",
    format: "article",
    status: "published",
    ...article,
  };
}

export function truncateText(text, maxLength) {
  if (!text) return "";

  if (text.length <= maxLength) return text;

  return text.substring(0, maxLength) + "...";
}