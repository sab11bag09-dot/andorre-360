import {
  ArticleDraft,
  ArticleSubmissionIntent,
} from "./types";

export type ArticleValidationError = {
  field: keyof ArticleDraft;
  message: string;
};

export type ArticleValidationResult =
  | {
      success: true;
      errors: [];
    }
  | {
      success: false;
      errors: ArticleValidationError[];
    };

function isValidUrl(value: string): boolean {
  if (!value) {
    return true;
  }

  // Accepte les chemins locaux du CMS
  if (value.startsWith("/")) {
    return true;
  }

  try {
    const url = new URL(value);

    return (
      url.protocol === "http:" ||
      url.protocol === "https:"
    );
  } catch {
    return false;
  }
}

function isValidDateRange(
  startsAt: string,
  endsAt: string
): boolean {
  if (!startsAt || !endsAt) {
    return true;
  }

  const startDate = new Date(startsAt);
  const endDate = new Date(endsAt);

  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime())
  ) {
    return false;
  }

  return endDate.getTime() > startDate.getTime();
}

export function validateArticleDraft(
  draft: ArticleDraft,
  intent: ArticleSubmissionIntent
): ArticleValidationResult {
  const errors: ArticleValidationError[] = [];

  const title = draft.title.trim();
  const slug = draft.slug.trim();
  const author = draft.author.trim();
  const description = draft.description.trim();
  const content = draft.content.trim();
  const image = draft.image.trim();
  const videoUrl = draft.videoUrl.trim();

  if (!title) {
    errors.push({
      field: "title",
      message: "Le titre est obligatoire.",
    });
  } else if (title.length > 160) {
    errors.push({
      field: "title",
      message:
        "Le titre ne doit pas dépasser 160 caractères.",
    });
  }

  if (!slug) {
    errors.push({
      field: "slug",
      message:
        "Le slug n’a pas pu être généré.",
    });
  }

  /*
   * Pour un brouillon, seuls le titre et le slug
   * sont strictement obligatoires.
   */
  if (intent === "publish") {
    if (!draft.category.trim()) {
      errors.push({
        field: "category",
        message: "La rubrique est obligatoire.",
      });
    }

    if (!author) {
      errors.push({
        field: "author",
        message: "L’auteur est obligatoire.",
      });
    }

    if (!description) {
      errors.push({
        field: "description",
        message: "Le chapô est obligatoire.",
      });
    } else if (description.length > 320) {
      errors.push({
        field: "description",
        message:
          "Le chapô ne doit pas dépasser 320 caractères.",
      });
    }

    if (!content) {
      errors.push({
        field: "content",
        message:
          "Le contenu de l’article est obligatoire.",
      });
    }

    if (
  draft.contentType !== "video" &&
  !image
) {
  errors.push({
    field: "image",
    message:
      "Une image de couverture est obligatoire pour publier.",
  });
}

    if (
      draft.contentType === "video" &&
      !videoUrl
    ) {
      errors.push({
        field: "videoUrl",
        message:
          "L’URL de la vidéo est obligatoire pour ce format.",
      });
    }
  }

  if (image && !isValidUrl(image)) {
    errors.push({
      field: "image",
      message:
        "L’adresse de l’image n’est pas valide.",
    });
  }

  if (videoUrl && !isValidUrl(videoUrl)) {
    errors.push({
      field: "videoUrl",
      message:
        "L’adresse de la vidéo n’est pas valide.",
    });
  }

  if (draft.priority < 0) {
    errors.push({
      field: "priority",
      message:
        "La priorité ne peut pas être négative.",
    });
  }

  if (
    !isValidDateRange(
      draft.startsAt,
      draft.endsAt
    )
  ) {
    errors.push({
      field: "endsAt",
      message:
        "La date de fin doit être postérieure à la date de début.",
    });
  }

  if (errors.length > 0) {
    return {
      success: false,
      errors,
    };
  }

  return {
    success: true,
    errors: [],
  };
}

export function getFirstValidationError(
  result: ArticleValidationResult
): ArticleValidationError | null {
  if (result.success) {
    return null;
  }

  return result.errors[0] ?? null;
}