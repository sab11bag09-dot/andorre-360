import type {
  EditorialEventAction,
  EditorialStatus,
} from "@/lib/generated/prisma/client";

import EditorialStatusBadge from "./EditorialStatusBadge";

export type EditorialHistoryItem = {
  id: number;
  action: EditorialEventAction;
  translationId: number | null;
  actorEmail: string;
  fromStatus: EditorialStatus | null;
  toStatus: EditorialStatus | null;
  details: string | null;
  createdAt: Date;
};

type EditorialHistoryPanelProps = {
  events: EditorialHistoryItem[];
};

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

function getContextLabels(value: string | null): string[] {
  const details = parseDetails(value);
  const labels: string[] = [];

  if (typeof details.locale === "string") {
    labels.push(LOCALE_LABELS[details.locale] ?? details.locale);
  }

  if (typeof details.operation === "string") {
    labels.push(
      OPERATION_LABELS[details.operation] ?? details.operation,
    );
  }

  if (typeof details.category === "string") {
    labels.push(`Catégorie : ${details.category}`);
  }

  if (
    typeof details.pageKey === "string" &&
    typeof details.zone === "string"
  ) {
    labels.push(`${details.pageKey} · ${details.zone}`);
  }

  if (typeof details.visible === "boolean") {
    labels.push(
      details.visible ? "Visible dans le Fil" : "Retiré du Fil",
    );
  }

  if (typeof details.pinned === "boolean") {
    labels.push(details.pinned ? "Épinglé" : "Non épinglé");
  }

  return labels;
}

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Andorra",
  }).format(value);
}

export default function EditorialHistoryPanel({
  events,
}: EditorialHistoryPanelProps) {
  return (
    <section
      aria-labelledby="editorial-history-title"
      className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900"
    >
      <details>
        <summary className="cursor-pointer list-none px-5 py-4 marker:hidden">
          <span
            id="editorial-history-title"
            className="text-sm font-semibold text-zinc-100"
          >
            Historique éditorial
          </span>
          <span className="ml-2 text-xs text-zinc-500">
            {events.length === 0
              ? "Aucune action enregistrée"
              : `${events.length} action${events.length > 1 ? "s" : ""} récente${events.length > 1 ? "s" : ""}`}
          </span>
        </summary>

        <div className="border-t border-zinc-800 px-5 py-4">
          {events.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Les prochaines actions éditoriales apparaîtront ici.
            </p>
          ) : (
            <ol className="max-h-[32rem] space-y-3 overflow-y-auto pr-1">
              {events.map((event) => {
                const contextLabels = getContextLabels(event.details);

                return (
                  <li
                    key={event.id}
                    className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-zinc-100">
                          {ACTION_LABELS[event.action]}
                        </p>

                        {contextLabels.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {contextLabels.map((label) => (
                              <span
                                key={label}
                                className="rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-300"
                              >
                                {label}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {(event.fromStatus || event.toStatus) && (
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                          {event.fromStatus && (
                            <EditorialStatusBadge status={event.fromStatus} />
                          )}
                          {event.fromStatus && event.toStatus && (
                            <span aria-hidden="true">→</span>
                          )}
                          {event.toStatus && (
                            <EditorialStatusBadge status={event.toStatus} />
                          )}
                        </div>
                      )}
                    </div>

                    <p className="mt-3 text-xs text-zinc-500">
                      {event.actorEmail}
                      {" · "}
                      <time dateTime={event.createdAt.toISOString()}>
                        {formatDate(event.createdAt)}
                      </time>
                    </p>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </details>
    </section>
  );
}
