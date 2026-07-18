"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

/* =========================================================
   OUTILS
========================================================= */

function getRequiredString(
  formData: FormData,
  field: string
): string {
  const value = formData.get(field);

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Le champ "${field}" est obligatoire.`);
  }

  return value.trim();
}

function getOptionalString(
  formData: FormData,
  field: string
): string | null {
  const value = formData.get(field);

  if (typeof value !== "string") {
    return null;
  }

  const cleanedValue = value.trim();

  return cleanedValue || null;
}

function getOptionalDate(
  formData: FormData,
  field: string
): Date | null {
  const value = getOptionalString(formData, field);

  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function createUniqueSlug(
  title: string
): Promise<string> {
  const baseSlug =
    slugify(title) || `contenu-${Date.now()}`;

  const existingArticle =
    await prisma.article.findUnique({
      where: {
        slug: baseSlug,
      },
      select: {
        id: true,
      },
    });

  if (!existingArticle) {
    return baseSlug;
  }

  return `${baseSlug}-${Date.now()}`;
}

/* =========================================================
   REVALIDATION
========================================================= */

function revalidatePublicPages(slug?: string) {
  revalidatePath("/");
  revalidatePath("/admin");

  revalidatePath("/actualite");
  revalidatePath("/economie");
  revalidatePath("/societe");
  revalidatePath("/culture");
  revalidatePath("/sports");
  revalidatePath("/montagne");

  if (slug) {
    revalidatePath(`/article/${slug}`);
  }
}

/* =========================================================
   CRÉATION
========================================================= */

export async function createArticle(
  formData: FormData
) {
  const title = getRequiredString(formData, "title");

  const category = getRequiredString(
    formData,
    "category"
  );

  const description = getRequiredString(
    formData,
    "description"
  );

  const content = getRequiredString(
    formData,
    "content"
  );

  const image = getRequiredString(
    formData,
    "image"
  );

  const author = getRequiredString(
    formData,
    "author"
  );

  const contentType =
    getOptionalString(
      formData,
      "contentType"
    ) ?? "article";

  const readingTime =
    getOptionalString(
      formData,
      "readingTime"
    ) ?? "1 min";

  const videoUrl =
    getOptionalString(
      formData,
      "videoUrl"
    );

  const videoDuration =
    getOptionalString(
      formData,
      "videoDuration"
    );

  const socialText =
    getOptionalString(
      formData,
      "socialText"
    );

  const featured =
    formData.get("featured") === "on";

  const pageKey =
    getOptionalString(
      formData,
      "pageKey"
    ) ?? "home";

  const channel =
    getOptionalString(
      formData,
      "channel"
    ) ?? "site";

  const zone =
    getOptionalString(
      formData,
      "zone"
    ) ?? "standard";

  const priorityValue =
    getOptionalString(
      formData,
      "priority"
    ) ?? "0";

  const priority =
    Number(priorityValue) || 0;

  const startsAt =
    getOptionalDate(
      formData,
      "startsAt"
    );

  const endsAt =
    getOptionalDate(
      formData,
      "endsAt"
    );

  const slug =
    await createUniqueSlug(title);

  const createdArticle =
    await prisma.$transaction(
      async (transaction) => {
        const article =
          await transaction.article.create({
            data: {
              title,
              slug,
              category,
              description,
              content,
              image,
              author,
              readingTime,
              contentType,
              videoUrl,
              videoDuration,
              socialText,
              featured,
              published: true,
            },
          });

        await transaction.publication.create({
          data: {
            articleId: article.id,
            channel,
            pageKey,
            zone,
            priority,
            startsAt,
            endsAt,
            active: true,
          },
        });

        return article;
      }
    );

  revalidatePublicPages(
    createdArticle.slug
  );

  redirect(
    `/article/${createdArticle.slug}`
  );
}

/* =========================================================
   MODIFICATION
========================================================= */

export async function updateArticle(
  articleId: number,
  formData: FormData
) {
  const title = getRequiredString(
    formData,
    "title"
  );

  const category = getRequiredString(
    formData,
    "category"
  );

  const description =
    getRequiredString(
      formData,
      "description"
    );

  const content =
    getRequiredString(
      formData,
      "content"
    );

  const image =
    getRequiredString(
      formData,
      "image"
    );

  const author =
    getRequiredString(
      formData,
      "author"
    );

  const contentType =
    getOptionalString(
      formData,
      "contentType"
    ) ?? "article";

  const readingTime =
    getOptionalString(
      formData,
      "readingTime"
    ) ?? "1 min";

  const videoUrl =
    getOptionalString(
      formData,
      "videoUrl"
    );

  const videoDuration =
    getOptionalString(
      formData,
      "videoDuration"
    );

  const socialText =
    getOptionalString(
      formData,
      "socialText"
    );

  const featured =
    formData.get("featured") === "on";

  const published =
    formData.get("published") === "on";

  const existingArticle =
    await prisma.article.findUnique({
      where: {
        id: articleId,
      },
    });

  if (!existingArticle) {
    throw new Error(
      "Article introuvable."
    );
  }

  const updatedArticle =
    await prisma.article.update({
      where: {
        id: articleId,
      },
      data: {
        title,
        category,
        description,
        content,
        image,
        author,
        readingTime,
        contentType,
        videoUrl,
        videoDuration,
        socialText,
        featured,
        published,
      },
    });

  revalidatePublicPages(
    updatedArticle.slug
  );

  revalidatePath(
    `/admin/articles/${articleId}`
  );

  redirect(
    `/article/${updatedArticle.slug}`
  );
}