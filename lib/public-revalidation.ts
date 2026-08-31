import { revalidatePath } from "next/cache";

export const PUBLIC_CATEGORY_PATHS: Record<string, string> = {
  "ACTUALITÉ": "/actualite",
  "ÉCONOMIE": "/economie",
  "SOCIÉTÉ": "/societe",
  POLITIQUE: "/politique",
  IMMOBILIER: "/immobilier",
  ILS_EN_PARLENT: "/ils-en-parlent",
  INTERNATIONAL: "/international",
  SPORTS: "/sports",
  CULTURE: "/culture",
  MONTAGNE: "/montagne",
  LOISIRS: "/loisirs",
  LIFESTYLE: "/lifestyle",
};

const TRANSLATED_FIL_INFO_PATHS = ["/ca/fil-info", "/es/fil-info"];

function uniqueNonEmpty(values: readonly string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

export function revalidateFilInfoPublicPages(): void {
  revalidatePath("/fil-info");

  for (const path of TRANSLATED_FIL_INFO_PATHS) {
    revalidatePath(path);
  }
}

export function revalidatePublicArticlePages({
  categories = [],
  slugs = [],
}: {
  categories?: readonly string[];
  slugs?: readonly string[];
} = {}): void {
  revalidatePath("/");

  const normalizedCategories = uniqueNonEmpty(categories);
  const normalizedSlugs = uniqueNonEmpty(slugs);

  for (const category of normalizedCategories) {
    const path = PUBLIC_CATEGORY_PATHS[category];

    if (path) {
      revalidatePath(path);
    }
  }

  if (normalizedCategories.includes("ACTUALITÉ")) {
    revalidateFilInfoPublicPages();
  }

  for (const slug of normalizedSlugs) {
    revalidatePath(`/article/${slug}`);
  }

  if (normalizedSlugs.length > 0) {
    revalidatePath("/[locale]/article/[slug]", "page");
  }
}

export function revalidateEditorialPublicPage(pageKey: string): void {
  revalidatePath("/");

  const category = pageKey.startsWith("category:")
    ? pageKey.slice("category:".length)
    : null;
  const categoryPath = category
    ? PUBLIC_CATEGORY_PATHS[category]
    : undefined;

  if (categoryPath) {
    revalidatePath(categoryPath);
  }
}

export function revalidateTranslatedPublicPages(locale?: string): void {
  revalidatePath("/[locale]/article/[slug]", "page");

  const normalizedLocale = locale?.trim().toLowerCase();

  if (normalizedLocale === "ca" || normalizedLocale === "es") {
    revalidatePath(`/${normalizedLocale}/fil-info`);
  }
}
