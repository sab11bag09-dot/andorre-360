import type {
  ContentLocale,
  EditorialStatus,
} from "@/lib/generated/prisma/client";

import { generateArticleTranslationsAction } from "@/app/admin/articles/translation-actions";
import {
  approveArticleAction,
  submitArticleForReviewAction,
} from "@/app/admin/articles/workflow-actions";
import {
  Badge,
  Button,
} from "@/components/admin/ui";

import EditorialStatusBadge from "./EditorialStatusBadge";

type TranslationSummary = {
  locale: ContentLocale;
  status: EditorialStatus;
};

type EditorialWorkflowPanelProps = {
  articleId: number;
  status: EditorialStatus;
  translations: TranslationSummary[];
};

const translationLocales: ContentLocale[] = [
  "CA",
  "ES",
];

export default function EditorialWorkflowPanel({
  articleId,
  status,
  translations,
}: EditorialWorkflowPanelProps) {
  const canGenerateTranslations =
    status !== "ARCHIVED";

  const canSubmitForReview =
    status === "DRAFT" ||
    status === "AI_DRAFT";

  const canApprove =
    status === "REVIEW";

  return (
    <section className="mb-6 flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Workflow éditorial
        </p>

        <EditorialStatusBadge
          status={status}
        />

        <div className="mt-4 flex flex-wrap gap-3">
          {translationLocales.map((locale) => {
            const translation =
              translations.find(
                (item) =>
                  item.locale === locale,
              );

            if (translation) {
              return (
                <Button
                  key={locale}
                  href={`/admin/articles/${articleId}/translations/${locale}`}
                  variant="outline"
                  className="gap-2 px-3 py-2"
                >
                  <span>{locale}</span>

                  <EditorialStatusBadge
                    status={translation.status}
                  />
                </Button>
              );
            }

            return (
              <div
                key={locale}
                className="flex items-center gap-2"
              >
                <span className="text-xs font-semibold text-zinc-400">
                  {locale}
                </span>

                <Badge variant="default">
                  Non générée
                </Badge>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {canGenerateTranslations && (
          <form
            action={generateArticleTranslationsAction.bind(
              null,
              articleId,
            )}
          >
            <Button
              type="submit"
              variant="outline"
            >
              Générer CA / ES
            </Button>
          </form>
        )}

        {canSubmitForReview && (
          <form
            action={submitArticleForReviewAction.bind(
              null,
              articleId,
            )}
          >
            <Button
              type="submit"
              variant="outline"
            >
              Envoyer en relecture
            </Button>
          </form>
        )}

        {canApprove && (
          <form
            action={approveArticleAction.bind(
              null,
              articleId,
            )}
          >
            <Button type="submit">
              Approuver
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
