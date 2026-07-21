"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

import {
  type ArticleDraft,
  type SaveArticleInput,
  type SaveArticleResult,
  calculateArticleReadingTime,
  slugifyArticleTitle,
} from "@/components/admin/article-v4/types";

import {
  getFirstValidationError,
  validateArticleDraft,
} from "@/components/admin/article-v4/validation";

/* =========================================================
   OUTILS
========================================================= */

function cleanRequiredValue(value: string): string {
  return value.trim();
}

function cleanOptionalValue(
  value: string
): string | null {
  const cleanedValue = value.trim();

  return cleanedValue || null;
}

function parseOptionalDate(
  value: string
): Date | null {
  const cleanedValue = value.trim();

  if (!cleanedValue) {
    return null;
  }

  const date = new Date(cleanedValue);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function normalizePriority(
  value: number
): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.trunc(value));
}

function normalizeDraft(
  draft: ArticleDraft
): ArticleDraft {
  const generatedSlug =
    slugifyArticleTitle(draft.slug) ||
    slugifyArticleTitle(draft.title);

  return {
    ...draft,

    title: cleanRequiredValue(draft.title),
    slug: generatedSlug,

    category: cleanRequiredValue(
      draft.category
    ),
    author: cleanRequiredValue(draft.author),

    description: cleanRequiredValue(
      draft.description
    ),
    content: cleanRequiredValue(
      draft.content
    ),

    image: cleanRequiredValue(draft.image),

    videoUrl: cleanRequiredValue(
      draft.videoUrl
    ),
    videoDuration: cleanRequiredValue(
      draft.videoDuration
    ),

    socialText: cleanRequiredValue(
      draft.socialText
    ),

    pageKey:
      cleanRequiredValue(draft.pageKey) ||
      "home",

    zone:
      cleanRequiredValue(draft.zone) ||
      "standard",

    channel:
      draft.channel || "site",

    priority: normalizePriority(
      draft.priority
    ),

    startsAt: cleanRequiredValue(
      draft.startsAt
    ),
    endsAt: cleanRequiredValue(
      draft.endsAt
    ),

    readingTime:
      calculateArticleReadingTime(
        draft.content
      ),
  };
}

async function createUniqueSlug(
  requestedSlug: string,
  articleId?: number
): Promise<string> {
  const baseSlug =
    slugifyArticleTitle(requestedSlug) ||
    `contenu-${Date.now()}`;

  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    const existingArticle =
      await prisma.article.findUnique({
        where: {
          slug: candidate,
        },
        select: {
          id: true,
        },
      });

    if (
      !existingArticle ||
      existingArticle.id === articleId
    ) {
      return candidate;
    }

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

/* =========================================================
   REVALIDATION
========================================================= */

function revalidateArticlePages(
  articleId: number,
  slug: string,
  previousSlug?: string
) {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/articles");
  revalidatePath(
    `/admin/articles/${articleId}`
  );

  revalidatePath("/actualite");
  revalidatePath("/economie");
  revalidatePath("/societe");
  revalidatePath("/culture");
  revalidatePath("/sports");
  revalidatePath("/montagne");

  revalidatePath(`/article/${slug}`);

  if (
    previousSlug &&
    previousSlug !== slug
  ) {
    revalidatePath(
      `/article/${previousSlug}`
    );
  }
}

/* =========================================================
   CRÉATION
========================================================= */

async function createArticle(
  input: SaveArticleInput,
  draft: ArticleDraft
): Promise<SaveArticleResult> {
  const shouldPublish =
    input.intent === "publish";

  const slug = await createUniqueSlug(
    draft.slug
  );

  const createdArticle =
    await prisma.$transaction(
      async (transaction) => {
        const article =
          await transaction.article.create({
            data: {
              title: draft.title,
              slug,

              category: draft.category,
              author: draft.author,

              description:
                draft.description,
              content: draft.content,

              image: draft.image,

              readingTime:
                draft.readingTime,

              contentType:
                draft.contentType,

              videoUrl:
                cleanOptionalValue(
                  draft.videoUrl
                ),

              videoDuration:
                cleanOptionalValue(
                  draft.videoDuration
                ),

              socialText:
                cleanOptionalValue(
                  draft.socialText
                ),

              featured:
                draft.featured,

              published:
                shouldPublish,
            },
          });

        if (shouldPublish) {
          await transaction.publication.create({
            data: {
              articleId: article.id,

              channel:
                draft.channel,

              pageKey:
                draft.pageKey,

              zone:
                draft.zone,

              priority:
                draft.priority,

              startsAt:
                parseOptionalDate(
                  draft.startsAt
                ),

              endsAt:
                parseOptionalDate(
                  draft.endsAt
                ),

              active: true,
            },
          });
        }

        return article;
      }
    );

  revalidateArticlePages(
    createdArticle.id,
    createdArticle.slug
  );

  return {
    success: true,
    articleId: createdArticle.id,
    slug: createdArticle.slug,
    published:
      createdArticle.published,

    redirectTo: shouldPublish
      ? `/article/${createdArticle.slug}`
      : `/admin/articles/${createdArticle.id}`,
  };
}

/* =========================================================
   MODIFICATION
========================================================= */

async function updateArticle(
  input: SaveArticleInput,
  draft: ArticleDraft
): Promise<SaveArticleResult> {
  if (draft.id === null) {
    return {
      success: false,
      message:
        "L’identifiant de l’article est manquant.",
      field: "id",
    };
  }

  const existingArticle =
    await prisma.article.findUnique({
      where: {
        id: draft.id,
      },
      select: {
        id: true,
        slug: true,
      },
    });

  if (!existingArticle) {
    return {
      success: false,
      message: "Article introuvable.",
      field: "id",
    };
  }

  const shouldPublish =
    input.intent === "publish";

  const slug = await createUniqueSlug(
    draft.slug,
    draft.id
  );

  const updatedArticle =
    await prisma.$transaction(
      async (transaction) => {
        const article =
          await transaction.article.update({
            where: {
              id: draft.id as number,
            },

            data: {
              title: draft.title,
              slug,

              category: draft.category,
              author: draft.author,

              description:
                draft.description,
              content: draft.content,

              image: draft.image,

              readingTime:
                draft.readingTime,

              contentType:
                draft.contentType,

              videoUrl:
                cleanOptionalValue(
                  draft.videoUrl
                ),

              videoDuration:
                cleanOptionalValue(
                  draft.videoDuration
                ),

              socialText:
                cleanOptionalValue(
                  draft.socialText
                ),

              featured:
                draft.featured,

              published:
                shouldPublish,
            },
          });
          console.log("UPDATED ARTICLE", {
  id: article.id,
  title: article.title,
  slug: article.slug,
});

        if (!shouldPublish) {
          await transaction.publication.updateMany({
            where: {
              articleId: article.id,
              active: true,
            },

            data: {
              active: false,
            },
          });

          return article;
        }

        const existingPublication =
          await transaction.publication.findFirst({
            where: {
              articleId: article.id,
            },

            orderBy: {
              createdAt: "desc",
            },

            select: {
              id: true,
            },
          });

        if (existingPublication) {
          await transaction.publication.update({
            where: {
              id: existingPublication.id,
            },

            data: {
              channel:
                draft.channel,

              pageKey:
                draft.pageKey,

              zone:
                draft.zone,

              priority:
                draft.priority,

              startsAt:
                parseOptionalDate(
                  draft.startsAt
                ),

              endsAt:
                parseOptionalDate(
                  draft.endsAt
                ),

              active: true,
            },
          });

          await transaction.publication.updateMany({
            where: {
              articleId: article.id,

              id: {
                not: existingPublication.id,
              },

              active: true,
            },

            data: {
              active: false,
            },
          });
        } else {
          await transaction.publication.create({
            data: {
              articleId: article.id,

              channel:
                draft.channel,

              pageKey:
                draft.pageKey,

              zone:
                draft.zone,

              priority:
                draft.priority,

              startsAt:
                parseOptionalDate(
                  draft.startsAt
                ),

              endsAt:
                parseOptionalDate(
                  draft.endsAt
                ),

              active: true,
            },
          });
        }

        return article;
      }
    );

  revalidateArticlePages(
    updatedArticle.id,
    updatedArticle.slug,
    existingArticle.slug
  );

  return {
    success: true,
    articleId: updatedArticle.id,
    slug: updatedArticle.slug,
    published:
      updatedArticle.published,

    redirectTo: shouldPublish
      ? `/article/${updatedArticle.slug}`
      : `/admin/articles/${updatedArticle.id}`,
  };
}

/* =========================================================
   ACTION PUBLIQUE V4
========================================================= */

export async function saveArticle(
  input: SaveArticleInput
): Promise<SaveArticleResult> {
  try {
    const draft = normalizeDraft(
      input.article
    );
    console.log("SAVE DRAFT", {
  id: draft.id,
  title: draft.title,
  slug: draft.slug,
});

    const validation =
      validateArticleDraft(
        draft,
        input.intent
      );

    if (!validation.success) {
      const firstError =
        getFirstValidationError(
          validation
        );

      return {
        success: false,

        message:
          firstError?.message ??
          "Les informations de l’article sont invalides.",

        field:
          firstError?.field,
      };
    }

    if (
      input.mode === "create"
    ) {
      return createArticle(
        input,
        draft
      );
    }

    return updateArticle(
      input,
      draft
    );
  } catch (error) {
    console.error(
      "Erreur pendant la sauvegarde V4 de l’article :",
      error
    );

    return {
      success: false,
      message:
        "Une erreur est survenue pendant la sauvegarde de l’article.",
    };
  }
}