import type { EditorialStatus } from "@/lib/generated/prisma/client";

import {
  approveArticleAction,
  submitArticleForReviewAction,
} from "@/app/admin/articles/workflow-actions";
import { Button } from "@/components/admin/ui";

import EditorialStatusBadge from "./EditorialStatusBadge";

type EditorialWorkflowPanelProps = {
  articleId: number;
  status: EditorialStatus;
};

export default function EditorialWorkflowPanel({
  articleId,
  status,
}: EditorialWorkflowPanelProps) {
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
      </div>

      <div className="flex flex-wrap gap-3">
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