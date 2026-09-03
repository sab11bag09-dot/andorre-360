"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin, type AdminIdentity } from "@/lib/admin/requireAdmin";
import { prisma } from "@/lib/prisma";
import { revalidatePublicArticlePages } from "@/lib/public-revalidation";
import { canPublishEditorialStatus } from "@/lib/article-engine/editorialWorkflow";
import { recordEditorialEvent } from "@/lib/editorial-history";
import { normalizeFilInfoFormat } from "@/lib/fil-info-format";
import {
  getMissingPublishedTranslationLocales,
  REQUIRED_TRANSLATION_LOCALES,
} from "@/lib/article-engine/multilingualPublicationGuard";

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

function cleanOptionalValue(value: string): string | null {
  const cleanedValue = value.trim();

  return cleanedValue || null;
}

function parseOptionalDate(value: string): Date | null {
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

function normalizePriority(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.trunc(value));
}

function normalizeDraft(draft: ArticleDraft): ArticleDraft {
  const generatedSlug =
    slugifyArticleTitle(draft.slug) || slugifyArticleTitle(draft.title);

  return {
    ...draft,

    title: cleanRequiredValue(draft.title),
    slug: generatedSlug,

    category: cleanRequiredValue(draft.category),
    author: cleanRequiredValue(draft.author),

    description: cleanRequiredValue(draft.description),
    content: cleanRequiredValue(draft.content),

    image: cleanRequiredValue(draft.image),
    filInfoFormat: normalizeFilInfoFormat(draft.filInfoFormat),

    videoUrl: cleanRequiredValue(draft.videoUrl),
    videoDuration: cleanRequiredValue(draft.videoDuration),

    socialText: cleanRequiredValue(draft.socialText),

    pageKey: cleanRequiredValue(draft.pageKey) || "home",

    zone: cleanRequiredValue(draft.zone) || "standard",

    channel: draft.channel || "site",

    priority: normalizePriority(draft.priority),

    startsAt: cleanRequiredValue(draft.startsAt),
    endsAt: cleanRequiredValue(draft.endsAt),

    readingTime: calculateArticleReadingTime(draft.content),
  };
}

async function createUniqueSlug(
  requestedSlug: string,
  articleId?: number,
): Promise<string> {
  const baseSlug =
    slugifyArticleTitle(requestedSlug) || `contenu-${Date.now()}`;

  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    const existingArticle = await prisma.article.findUnique({
      where: {
        slug: candidate,
      },
      select: {
        id: true,
      },
    });

    if (!existingArticle || existingArticle.id === articleId) {
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
  category: string,
  previousSlug?: string,
  previousCategory?: string,
) {
  revalidatePath("/admin");
  revalidatePath("/admin/articles");
  revalidatePath("/admin/media");
  revalidatePath(`/admin/articles/${articleId}`);

  revalidatePublicArticlePages({
    categories: [category, ...(previousCategory ? [previousCategory] : [])],
    slugs: [
      slug,
      ...(previousSlug && previousSlug !== slug ? [previousSlug] : []),
    ],
  });
}

/* =========================================================
   CRÉATION
========================================================= */

async function createArticle(
  input: SaveArticleInput,
  draft: ArticleDraft,
  admin: AdminIdentity,
): Promise<SaveArticleResult> {
  const shouldPublish = input.intent === "publish";
  if (shouldPublish) {
    return {
      success: false,
      message:
        "Enregistre d’abord l’article, puis fais-le relire et approuver.",
    };
  }

  const slug = await createUniqueSlug(draft.slug);

  const createdArticle = await prisma.$transaction(async (transaction) => {
    const article = await transaction.article.create({
      data: {
        title: draft.title,
        slug,

        category: draft.category,
        author: draft.author,

        description: draft.description,
        content: draft.content,

        image: draft.image,

        readingTime: draft.readingTime,

        contentType: draft.contentType,
        filInfoFormat: draft.filInfoFormat,

        videoUrl: cleanOptionalValue(draft.videoUrl),

        videoDuration: cleanOptionalValue(draft.videoDuration),

        socialText: cleanOptionalValue(draft.socialText),

        featured: draft.featured,

        published: shouldPublish,
        editorialStatus: "DRAFT",
      },
    });
    const media = await transaction.media.findUnique({
      where: {
        path: draft.image,
      },
    });

    if (media) {
      await transaction.mediaUsage.create({
        data: {
          mediaId: media.id,
          entityType: "ARTICLE",
          entityId: article.id,
          field: "image",
        },
      });
    }

    if (shouldPublish) {
      await transaction.publication.create({
        data: {
          articleId: article.id,

          channel: draft.channel,

          pageKey: draft.pageKey,

          zone: draft.zone,

          priority: draft.priority,

          startsAt: parseOptionalDate(draft.startsAt),

          endsAt: parseOptionalDate(draft.endsAt),

          active: true,
          origin: "MANUAL",
          locked: true,
          automationScore: null,
          automationPolicyVersion: null,
          automationRunId: null,
        },
      });
    }

    await recordEditorialEvent(transaction, {
      action: "ARTICLE_CREATED",
      articleId: article.id,
      actor: admin,
      toStatus: "DRAFT",
      details: {
        slug: article.slug,
        category: article.category,
      },
    });

    return article;
  });

  revalidateArticlePages(
    createdArticle.id,
    createdArticle.slug,
    createdArticle.category,
  );

  return {
    success: true,
    articleId: createdArticle.id,
    slug: createdArticle.slug,
    published: createdArticle.published,

    redirectTo: `/admin/articles/${createdArticle.id}`,
  };
}

/* =========================================================
   MODIFICATION
========================================================= */

async function updateArticle(
  input: SaveArticleInput,
  draft: ArticleDraft,
  admin: AdminIdentity,
): Promise<SaveArticleResult> {
  if (draft.id === null) {
    return {
      success: false,
      message: "L’identifiant de l’article est manquant.",
      field: "id",
    };
  }

  const existingArticle = await prisma.article.findUnique({
    where: {
      id: draft.id,
    },
    select: {
      id: true,
      slug: true,
      image: true,
      category: true,
      editorialStatus: true,
      publishedAt: true,
    },
  });

  if (!existingArticle) {
    return {
      success: false,
      message: "Article introuvable.",
      field: "id",
    };
  }

  const shouldPublish = input.intent === "publish";

  if (
    shouldPublish &&
    !canPublishEditorialStatus(existingArticle.editorialStatus)
  ) {
    return {
      success: false,
      message: "Cet article doit être relu et approuvé avant sa publication.",
    };
  }

  if (shouldPublish) {
    const translations = await prisma.articleTranslation.findMany({
      where: {
        articleId: draft.id,
        locale: {
          in: [...REQUIRED_TRANSLATION_LOCALES],
        },
      },
      select: {
        locale: true,
        status: true,
      },
    });

    const missingLocales = getMissingPublishedTranslationLocales(translations);

    if (missingLocales.length > 0) {
      return {
        success: false,
        message: `Publie d’abord les traductions suivantes : ${missingLocales.join(", ")}.`,
      };
    }
  }

  const slug = await createUniqueSlug(draft.slug, draft.id);

  const updatedArticle = await prisma.$transaction(async (transaction) => {
    const article = await transaction.article.update({
      where: {
        id: draft.id as number,
      },

      data: {
        title: draft.title,
        slug,

        category: draft.category,
        author: draft.author,

        description: draft.description,
        content: draft.content,

        image: draft.image,

        readingTime: draft.readingTime,

        contentType: draft.contentType,
        filInfoFormat: draft.filInfoFormat,

        videoUrl: cleanOptionalValue(draft.videoUrl),

        videoDuration: cleanOptionalValue(draft.videoDuration),

        socialText: cleanOptionalValue(draft.socialText),

        featured: draft.featured,

        published: shouldPublish,
        publishedAt: shouldPublish
          ? (existingArticle.publishedAt ?? new Date())
          : existingArticle.publishedAt,
        editorialStatus: shouldPublish
          ? "PUBLISHED"
          : existingArticle.editorialStatus === "PUBLISHED"
            ? "DRAFT"
            : existingArticle.editorialStatus,
      },
    });
    await transaction.mediaUsage.deleteMany({
      where: {
        entityType: "ARTICLE",
        entityId: article.id,
        field: "image",
      },
    });
    const media = await transaction.media.findUnique({
      where: {
        path: draft.image,
      },
    });

    if (media) {
      await transaction.mediaUsage.upsert({
        where: {
          mediaId_entityType_entityId_field: {
            mediaId: media.id,
            entityType: "ARTICLE",
            entityId: article.id,
            field: "image",
          },
        },
        update: {},
        create: {
          mediaId: media.id,
          entityType: "ARTICLE",
          entityId: article.id,
          field: "image",
        },
      });
    }
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

      await recordEditorialEvent(transaction, {
        action:
          existingArticle.editorialStatus === "PUBLISHED"
            ? "ARTICLE_UNPUBLISHED"
            : "ARTICLE_UPDATED",
        articleId: article.id,
        actor: admin,
        fromStatus: existingArticle.editorialStatus,
        toStatus: article.editorialStatus,
        details: {
          slug: article.slug,
          category: article.category,
        },
      });

      return article;
    }

    const existingPublication = await transaction.publication.findFirst({
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
          channel: draft.channel,

          pageKey: draft.pageKey,

          zone: draft.zone,

          priority: draft.priority,

          startsAt: parseOptionalDate(draft.startsAt),

          endsAt: parseOptionalDate(draft.endsAt),

          active: true,
          origin: "MANUAL",
          locked: true,
          automationScore: null,
          automationPolicyVersion: null,
          automationRunId: null,
        },
      });

      await transaction.publication.updateMany({
        where: {
          articleId: article.id,

          id: {
            not: existingPublication.id,
          },

          active: true,
          origin: "MANUAL",
          locked: true,
          automationScore: null,
          automationPolicyVersion: null,
          automationRunId: null,
        },

        data: {
          active: false,
        },
      });
    } else {
      await transaction.publication.create({
        data: {
          articleId: article.id,

          channel: draft.channel,

          pageKey: draft.pageKey,

          zone: draft.zone,

          priority: draft.priority,

          startsAt: parseOptionalDate(draft.startsAt),

          endsAt: parseOptionalDate(draft.endsAt),

          active: true,
          origin: "MANUAL",
          locked: true,
          automationScore: null,
          automationPolicyVersion: null,
          automationRunId: null,
        },
      });
    }

    await recordEditorialEvent(transaction, {
      action:
        existingArticle.editorialStatus === "PUBLISHED"
          ? "ARTICLE_UPDATED"
          : "ARTICLE_PUBLISHED",
      articleId: article.id,
      actor: admin,
      fromStatus: existingArticle.editorialStatus,
      toStatus: article.editorialStatus,
      details: {
        slug: article.slug,
        category: article.category,
      },
    });

    return article;
  });

  revalidateArticlePages(
    updatedArticle.id,
    updatedArticle.slug,
    updatedArticle.category,
    existingArticle.slug,
    existingArticle.category,
  );

  return {
    success: true,
    articleId: updatedArticle.id,
    slug: updatedArticle.slug,
    published: updatedArticle.published,

    redirectTo: shouldPublish
      ? `/article/${updatedArticle.slug}`
      : `/admin/articles/${updatedArticle.id}`,
  };
}

/* =========================================================
   ACTION PUBLIQUE V4
========================================================= */

export async function saveArticle(
  input: SaveArticleInput,
): Promise<SaveArticleResult> {
  const admin = await requireAdmin();

  try {
    const draft = normalizeDraft(input.article);
    console.log("SAVE DRAFT", {
      id: draft.id,
      title: draft.title,
      slug: draft.slug,
    });

    const validation = validateArticleDraft(draft, input.intent);

    if (!validation.success) {
      const firstError = getFirstValidationError(validation);

      return {
        success: false,

        message:
          firstError?.message ??
          "Les informations de l’article sont invalides.",

        field: firstError?.field,
      };
    }

    if (input.mode === "create") {
      return createArticle(input, draft, admin);
    }

    return updateArticle(input, draft, admin);
  } catch (error) {
    console.error("Erreur pendant la sauvegarde V4 de l’article :", error);

    return {
      success: false,
      message: "Une erreur est survenue pendant la sauvegarde de l’article.",
    };
  }
}
