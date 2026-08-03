import type { EditorialEventAction } from "@/lib/generated/prisma/client";

import { EDITORIAL_EVENT_ACTIONS } from "./editorial-history-display";

export type EditorialHistoryFilters = {
  articleId: number | null;
  actor: string;
  action: EditorialEventAction | null;
  page: number;
};

type SearchParams = Record<
  string,
  string | string[] | undefined
>;

function getSingleValue(
  value: string | string[] | undefined,
): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function parsePositiveInteger(value: string): number | null {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function isEditorialEventAction(
  value: string,
): value is EditorialEventAction {
  return EDITORIAL_EVENT_ACTIONS.some((action) => action === value);
}

export function parseEditorialHistoryFilters(
  params: SearchParams | undefined,
): EditorialHistoryFilters {
  const articleId = parsePositiveInteger(
    getSingleValue(params?.articleId),
  );
  const actor = getSingleValue(params?.actor).trim().slice(0, 160);
  const actionValue = getSingleValue(params?.action);
  const page = parsePositiveInteger(getSingleValue(params?.page)) ?? 1;

  return {
    articleId,
    actor,
    action: isEditorialEventAction(actionValue) ? actionValue : null,
    page,
  };
}

export function buildEditorialHistoryHref(
  filters: EditorialHistoryFilters,
  page: number,
): string {
  const params = new URLSearchParams();

  if (filters.articleId) {
    params.set("articleId", filters.articleId.toString());
  }

  if (filters.actor) {
    params.set("actor", filters.actor);
  }

  if (filters.action) {
    params.set("action", filters.action);
  }

  if (page > 1) {
    params.set("page", page.toString());
  }

  const query = params.toString();
  return query ? `/admin/history?${query}` : "/admin/history";
}
