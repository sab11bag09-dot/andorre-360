import { getPublishedArticles } from "@/lib/articles";
import type { EditorialLayout } from "@/lib/editorial/types";
import { EDITORIAL_ZONE_CONFIG } from "@/lib/editorial/zones";

type BuildEditorialPageDataParams = {
  editorialLayout: EditorialLayout;
  publishedArticles: Awaited<
    ReturnType<typeof getPublishedArticles>
  >;
};

export function buildEditorialPageData({
  editorialLayout,
  publishedArticles,
}: BuildEditorialPageDataParams) {
  const usedArticleIds = new Set<number>();

  if (editorialLayout.hero) {
    usedArticleIds.add(editorialLayout.hero.id);
  }

  if (editorialLayout.feature) {
    usedArticleIds.add(editorialLayout.feature.id);
  }

  editorialLayout.secondary.forEach((article) => {
    usedArticleIds.add(article.id);
  });

  editorialLayout.briefs.forEach((article) => {
    usedArticleIds.add(article.id);
  });

  if (editorialLayout.grandFormat) {
    usedArticleIds.add(editorialLayout.grandFormat.id);
  }

  if (editorialLayout.question) {
    usedArticleIds.add(editorialLayout.question.id);
  }

  editorialLayout.goodToKnow.forEach((article) => {
    usedArticleIds.add(article.id);
  });

  const availableArticles = publishedArticles.filter(
    (article) => !usedArticleIds.has(article.id)
  );

  const hero =
    editorialLayout.hero ??
    availableArticles.shift() ??
    null;

  const feature =
    editorialLayout.feature ??
    availableArticles.shift() ??
    null;

  const question =
    editorialLayout.question ??
    availableArticles.shift() ??
    null;

  const secondary = [...editorialLayout.secondary];

  while (
    secondary.length <
      EDITORIAL_ZONE_CONFIG.secondary.slots &&
    availableArticles.length > 0
  ) {
    const article = availableArticles.shift();

    if (article) {
      secondary.push(article);
    }
  }

  const goodToKnow = [...editorialLayout.goodToKnow];

  while (
    goodToKnow.length <
      EDITORIAL_ZONE_CONFIG["good-to-know"].slots &&
    availableArticles.length > 0
  ) {
    const article = availableArticles.shift();

    if (article) {
      goodToKnow.push(article);
    }
  }

  const briefs = [...editorialLayout.briefs];

  while (
    briefs.length < EDITORIAL_ZONE_CONFIG.brief.slots &&
    availableArticles.length > 0
  ) {
    const article = availableArticles.shift();

    if (article) {
      briefs.push(article);
    }
  }

  const bottom =
    editorialLayout.grandFormat ??
    availableArticles.shift() ??
    null;

  return {
    hero,
    feature,
    question,
    secondary,
    goodToKnow,
    briefs,
    bottom,
  };
}