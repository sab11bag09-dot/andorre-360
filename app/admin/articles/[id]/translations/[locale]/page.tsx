import { notFound } from "next/navigation";

import {
  approveArticleTranslationAction,
  archiveArticleTranslationAction,
  publishArticleTranslationAction,
  returnArticleTranslationToDraftAction,
  submitArticleTranslationForReviewAction,
  updateArticleTranslationAction,
  updateArticleTranslationSlugAction,
} from "@/app/admin/articles/translation-actions";
import ConfirmTranslationActionButton from "@/components/admin/article/ConfirmTranslationActionButton";
import EditorialStatusBadge from "@/components/admin/article/EditorialStatusBadge";
import {
  Button,
  Input,
  Textarea,
} from "@/components/admin/ui";
import { prisma } from "@/lib/prisma";

function isTranslationLocale(
  locale: string,
): locale is "CA" | "ES" {
  return (
    locale === "CA" ||
    locale === "ES"
  );
}

export default async function EditArticleTranslationPage({
  params,
}: {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}) {
  const {
    id,
    locale,
  } = await params;

  const articleId = Number(id);

  if (
    !Number.isInteger(articleId) ||
    articleId <= 0 ||
    !isTranslationLocale(locale)
  ) {
    notFound();
  }

  const translation =
    await prisma.articleTranslation.findUnique({
      where: {
        articleId_locale: {
          articleId,
          locale,
        },
      },
      include: {
        article: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

  if (!translation) {
    notFound();
  }

  const canEdit =
    translation.status === "DRAFT" ||
    translation.status === "AI_DRAFT";

  const canSubmitForReview =
    canEdit;

  const canReturnToDraft =
    translation.status === "REVIEW";

  const canApprove =
    translation.status === "REVIEW";

  const canPublish =
    translation.status === "APPROVED";

  const canArchive =
    translation.status === "PUBLISHED";

  const canEditSlug =
    translation.publishedAt === null &&
    translation.status !== "ARCHIVED";

  const lockedMessage =
    translation.status === "REVIEW"
      ? "Le contenu est verrouillé pendant la relecture. Revenez au brouillon pour le modifier."
      : translation.status === "APPROVED"
        ? "La traduction est approuvée et prête à être publiée."
        : translation.status === "PUBLISHED"
          ? "La traduction est publiée. Retirez-la de la publication avant toute correction."
          : translation.status === "ARCHIVED"
            ? "La traduction est archivée et son contenu est conservé."
            : null;

  const languageLabel =
    locale === "CA"
      ? "Catalan"
      : "Espagnol";

  return (
    <main className="min-h-screen bg-zinc-950 p-6 text-white md:p-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Traduction {languageLabel}
            </p>

            <h1 className="text-3xl font-bold">
              {translation.article.title}
            </h1>

            <div className="mt-4">
              <EditorialStatusBadge
                status={translation.status}
              />
            </div>
          </div>

          <Button
            href={`/admin/articles/${articleId}`}
            variant="secondary"
          >
            Retour à l’article
          </Button>
        </div>

        <section className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="mb-4 text-lg font-semibold">
            Workflow de la traduction
          </h2>

          <div className="flex flex-wrap gap-3">
            {canSubmitForReview && (
              <form
                action={submitArticleTranslationForReviewAction.bind(
                  null,
                  articleId,
                  locale,
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

            {canReturnToDraft && (
              <form
                action={returnArticleTranslationToDraftAction.bind(
                  null,
                  articleId,
                  locale,
                )}
              >
                <Button
                  type="submit"
                  variant="outline"
                >
                  Revenir au brouillon
                </Button>
              </form>
            )}

            {canApprove && (
              <form
                action={approveArticleTranslationAction.bind(
                  null,
                  articleId,
                  locale,
                )}
              >
                <Button type="submit">
                  Approuver
                </Button>
              </form>
            )}

            {canPublish && (
              <form
                action={publishArticleTranslationAction.bind(
                  null,
                  articleId,
                  locale,
                )}
              >
                <ConfirmTranslationActionButton
                  label="Publier"
                  message="Confirmer la publication de cette traduction ?"
                />
              </form>
            )}

            {canArchive && (
              <form
                action={archiveArticleTranslationAction.bind(
                  null,
                  articleId,
                  locale,
                )}
              >
                <ConfirmTranslationActionButton
                  label="Retirer de la publication"
                  message="Confirmer le retrait de cette traduction ? Son contenu sera conservé."
                  variant="danger"
                />
              </form>
            )}
          </div>
        </section>

        {lockedMessage && (
          <div className="mb-6 rounded-xl border border-yellow-900 bg-yellow-950/40 p-4 text-sm text-yellow-200">
            {lockedMessage}
          </div>
        )}

        <form
          action={updateArticleTranslationSlugAction.bind(
            null,
            articleId,
            locale,
          )}
          className="mb-6 space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
        >
          <label className="block text-sm font-semibold text-zinc-300">
            Slug public
            <Input
              name="slug"
              defaultValue={translation.slug}
              disabled={!canEditSlug}
              required
            />
            <span className="mt-2 block text-xs font-normal text-zinc-500">
              Normalisé automatiquement. URL actuelle :{" "}
              {`/${locale.toLowerCase()}/article/${translation.slug}`}
            </span>
          </label>

          {canEditSlug && (
            <div className="flex justify-end">
              <Button type="submit" variant="outline">
                Enregistrer le slug
              </Button>
            </div>
          )}
        </form>

        <form
          action={updateArticleTranslationAction.bind(
            null,
            articleId,
            locale,
          )}
          className="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
        >
          <label className="block text-sm font-semibold text-zinc-300">
            Titre
            <Input
              name="title"
              defaultValue={translation.title}
              disabled={!canEdit}
              required
            />
          </label>

          <label className="block text-sm font-semibold text-zinc-300">
            Chapô
            <Textarea
              name="description"
              defaultValue={
                translation.description
              }
              disabled={!canEdit}
              required
              rows={4}
            />
          </label>

          <label className="block text-sm font-semibold text-zinc-300">
            Contenu
            <Textarea
              name="content"
              defaultValue={translation.content}
              disabled={!canEdit}
              required
              rows={18}
            />
          </label>

          {canEdit && (
            <div className="flex justify-end">
              <Button type="submit">
                Enregistrer les corrections
              </Button>
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
