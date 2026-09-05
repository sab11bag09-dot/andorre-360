import type { EditorialEventAction } from "@/lib/generated/prisma/client";

export const EDITORIAL_EVENT_ACTIONS = [
  "ARTICLE_CREATED",
  "ARTICLE_UPDATED",
  "ARTICLE_PUBLISHED",
  "ARTICLE_UNPUBLISHED",
  "ARTICLE_STATUS_CHANGED",
  "TRANSLATION_GENERATED",
  "TRANSLATION_UPDATED",
  "TRANSLATION_STATUS_CHANGED",
  "TRANSLATION_PUBLISHED",
  "TRANSLATION_ARCHIVED",
  "FIL_INFO_UPDATED",
  "PUBLICATION_PLACED",
  "HOME_COMPOSITION_APPLIED",
  "HOME_COMPOSITION_ROLLED_BACK",
] as const satisfies readonly EditorialEventAction[];

const ACTION_LABELS: Record<EditorialEventAction, string> = {
  ARTICLE_CREATED: "Article créé",
  ARTICLE_UPDATED: "Article modifié",
  ARTICLE_PUBLISHED: "Article publié",
  ARTICLE_UNPUBLISHED: "Article dépublié",
  ARTICLE_STATUS_CHANGED: "Statut de l’article modifié",
  TRANSLATION_GENERATED: "Traduction générée",
  TRANSLATION_UPDATED: "Traduction modifiée",
  TRANSLATION_STATUS_CHANGED: "Statut de la traduction modifié",
  TRANSLATION_PUBLISHED: "Traduction publiée",
  TRANSLATION_ARCHIVED: "Traduction archivée",
  FIL_INFO_UPDATED: "Réglages du Fil info modifiés",
  PUBLICATION_PLACED: "Placement éditorial modifié",
  HOME_COMPOSITION_APPLIED: "Composition de l’accueil appliquée",
  HOME_COMPOSITION_ROLLED_BACK: "Composition de l’accueil annulée",
};

const LOCALE_LABELS: Record<string, string> = {
  FR: "Français",
  CA: "Catalan",
  ES: "Espagnol",
};

const OPERATION_LABELS: Record<string, string> = {
  created: "Création",
  updated: "Régénération",
  content: "Contenu",
  slug: "Slug",
  status: "Statut",
  publication: "Publication",
};

function parseDetails(value: string | null): Record<string, unknown> {
  if (!value) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(value);

    return typeof parsed === "object" && parsed !== null
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

export function getEditorialEventActionLabel(
  action: EditorialEventAction,
): string {
  return ACTION_LABELS[action];
}

export function getEditorialEventContextLabels(value: string | null): string[] {
  const details = parseDetails(value);
  const labels: string[] = [];

  if (typeof details.locale === "string") {
    labels.push(LOCALE_LABELS[details.locale] ?? details.locale);
  }

  if (typeof details.operation === "string") {
    labels.push(OPERATION_LABELS[details.operation] ?? details.operation);
  }

  if (typeof details.category === "string") {
    labels.push(`Catégorie : ${details.category}`);
  }

  if (typeof details.pageKey === "string" && typeof details.zone === "string") {
    labels.push(`${details.pageKey} · ${details.zone}`);
  }

  if (typeof details.visible === "boolean") {
    labels.push(details.visible ? "Visible dans le Fil" : "Retiré du Fil");
  }

  if (typeof details.pinned === "boolean") {
    labels.push(details.pinned ? "Épinglé" : "Non épinglé");
  }

  return labels;
}

export function formatEditorialEventDate(value: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Andorra",
  }).format(value);
}
