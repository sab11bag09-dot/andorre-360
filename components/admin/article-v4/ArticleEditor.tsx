"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import ArticleContent from "@/components/admin/article-v5/ArticleContent";
import ArticleEditorial from "@/components/admin/article/ArticleEditorial";
import ArticleMedia from "@/components/admin/article/ArticleMedia";
import ArticleSidebar from "@/components/admin/article/ArticleSidebar";
import {
  Button,
  PageHeader,
  Select,
} from "@/components/admin/ui";
import { canPublishEditorialStatus } from "@/lib/article-engine/editorialWorkflow";

import { submitArticle } from "./submitArticle";
import {
  type ArticleContentType,
  type ArticleDraft,
  type ArticleEditorMode,
  type ArticleSubmissionIntent,
  EDITORIAL_ZONES,
  calculateArticleReadingTime,
  calculateArticleWordCount,
  createArticleDraft,
  slugifyArticleTitle,
} from "./types";

type Props = {
  mode?: ArticleEditorMode;
  initialValues?: Partial<ArticleDraft>;
};

const CONTENT_TYPES: Array<{
  value: ArticleContentType;
  label: string;
}> = [
  {
    value: "article",
    label: "Article",
  },
  {
    value: "editorial",
    label: "Éditorial",
  },
  {
    value: "video",
    label: "Vidéo",
  },
  {
    value: "interview",
    label: "Interview",
  },
  {
    value: "podcast",
    label: "Podcast",
  },
  {
    value: "gallery",
    label: "Galerie",
  },
];

export default function ArticleEditor({
  mode = "create",
  initialValues,
}: Props) {
  const router = useRouter();

  const [draft, setDraft] = useState<ArticleDraft>(
    () => createArticleDraft(initialValues),
  );

  const [isSaving, setIsSaving] =
    useState(false);

  const [activeIntent, setActiveIntent] =
    useState<ArticleSubmissionIntent | null>(
      null,
    );

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const wordCount = useMemo(
    () =>
      calculateArticleWordCount(
        draft.content,
      ),
    [draft.content],
  );

  const readingTime = useMemo(() => {
    const readingTimeLabel =
      calculateArticleReadingTime(
        draft.content,
      );

    const parsedReadingTime =
      Number.parseInt(
        readingTimeLabel,
        10,
      );

    return Number.isNaN(parsedReadingTime)
      ? 1
      : parsedReadingTime;
  }, [draft.content]);

  const canPublish =
    canPublishEditorialStatus(
      draft.editorialStatus,
    );

  const selectedZone = useMemo(
    () =>
      EDITORIAL_ZONES.find(
        (editorialZone) =>
          editorialZone.value ===
          draft.zone,
      ),
    [draft.zone],
  );

  function clearError() {
    if (errorMessage) {
      setErrorMessage(null);
    }
  }

  function updateField<
    K extends keyof ArticleDraft,
  >(
    field: K,
    value: ArticleDraft[K],
  ) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }));

    clearError();
  }

  function handleTitleChange(
    value: string,
  ) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      title: value,
      slug: slugifyArticleTitle(value),
    }));

    clearError();
  }

  function handleContentChange(
    value: string,
  ) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      content: value,
      readingTime:
        calculateArticleReadingTime(value),
    }));

    clearError();
  }

  async function handleIntent(
    intent: ArticleSubmissionIntent,
  ) {
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    setActiveIntent(intent);
    setErrorMessage(null);

    try {
      const result = await submitArticle({
        mode,
        intent,
        draft,
      });

      if (!result.success) {
        setErrorMessage(result.message);
        return;
      }

      router.push(result.redirectTo);
      router.refresh();
    } catch (error) {
      console.error(
        "Erreur pendant la soumission de l’article :",
        error,
      );

      setErrorMessage(
        "Une erreur inattendue est survenue pendant la sauvegarde.",
      );
    } finally {
      setIsSaving(false);
      setActiveIntent(null);
    }
  }

  const pageTitle =
    mode === "create"
      ? "Nouvelle publication"
      : "Modifier la publication";

  const pageDescription =
    mode === "create"
      ? "Préparez un nouveau contenu éditorial."
      : "Mettez à jour le contenu et sa diffusion.";

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        eyebrow="ANDORRE 360 Studio"
        title={pageTitle}
        description={pageDescription}
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                handleIntent("draft")
              }
              disabled={isSaving}
            >
              {isSaving &&
              activeIntent === "draft"
                ? "Enregistrement…"
                : "Enregistrer"}
            </Button>

            <Button
              type="button"
              onClick={() =>
                handleIntent("publish")
              }
              disabled={
                isSaving || !canPublish
              }
            >
              {isSaving &&
              activeIntent === "publish"
                ? "Publication…"
                : canPublish
                  ? "Publier"
                  : "Validation requise"}
            </Button>
          </>
        }
      />

      {!canPublish && (
        <div
          role="status"
          className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-200"
        >
          {draft.id === null
            ? "Enregistre d’abord l’article, puis envoie-le en relecture."
            : "Cet article doit être relu et approuvé avant sa publication."}
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-4 text-sm text-red-200"
        >
          <p className="font-semibold">
            La sauvegarde a échoué
          </p>

          <p className="mt-1">
            {errorMessage}
          </p>
        </div>
      )}

      <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-8">
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
            <div className="border-b border-zinc-800 pb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-500">
                Format
              </p>

              <h2 className="mt-2 font-serif text-2xl text-white">
                Type de publication
              </h2>
            </div>

            <div className="mt-6">
              <label
                htmlFor="contentType"
                className="mb-2 block font-semibold text-zinc-200"
              >
                Format éditorial
              </label>

              <Select
                id="contentType"
                value={draft.contentType}
                onChange={(event) =>
                  updateField(
                    "contentType",
                    event.target
                      .value as ArticleContentType,
                  )
                }
                disabled={isSaving}
                className="mt-0"
              >
                {CONTENT_TYPES.map(
                  (contentType) => (
                    <option
                      key={contentType.value}
                      value={contentType.value}
                    >
                      {contentType.label}
                    </option>
                  ),
                )}
              </Select>
            </div>
          </section>

          <ArticleContent
            title={draft.title}
            setTitle={handleTitleChange}
            category={draft.category}
            setCategory={(value) =>
              updateField(
                "category",
                value,
              )
            }
            author={draft.author}
            setAuthor={(value) =>
              updateField(
                "author",
                value,
              )
            }
            description={draft.description}
            setDescription={(value) =>
              updateField(
                "description",
                value,
              )
            }
            content={draft.content}
            setContent={handleContentChange}
            wordCount={wordCount}
            readingTime={readingTime}
          />

          <ArticleMedia
            image={draft.image}
            setImage={(value) =>
              updateField("image", value)
            }
            contentType={draft.contentType}
            videoUrl={draft.videoUrl}
            setVideoUrl={(value) =>
              updateField(
                "videoUrl",
                value,
              )
            }
            videoDuration={
              draft.videoDuration
            }
            setVideoDuration={(value) =>
              updateField(
                "videoDuration",
                value,
              )
            }
          />
        </div>

        <aside className="space-y-8 xl:sticky xl:top-6">
          <ArticleEditorial
            pageKey={draft.pageKey}
            setPageKey={(value) =>
              updateField(
                "pageKey",
                value,
              )
            }
            zone={draft.zone}
            setZone={(value) =>
              updateField("zone", value)
            }
            priority={String(
              draft.priority,
            )}
            setPriority={(value) => {
              const parsedPriority =
                Number.parseInt(
                  value,
                  10,
                );

              updateField(
                "priority",
                Number.isNaN(
                  parsedPriority,
                )
                  ? 0
                  : parsedPriority,
              );
            }}
            channel={draft.channel}
            setChannel={(value) =>
              updateField(
                "channel",
                value as ArticleDraft["channel"],
              )
            }
            startsAt={draft.startsAt}
            setStartsAt={(value) =>
              updateField(
                "startsAt",
                value,
              )
            }
            endsAt={draft.endsAt}
            setEndsAt={(value) =>
              updateField(
                "endsAt",
                value,
              )
            }
          />

          <ArticleSidebar
            contentType={draft.contentType}
            slug={draft.slug}
            wordCount={wordCount}
            readingTime={readingTime}
            pageKey={draft.pageKey}
            zoneLabel={
              selectedZone?.label ??
              draft.zone ??
              "—"
            }
            featured={draft.featured}
            setFeatured={(value) =>
              updateField(
                "featured",
                value,
              )
            }
          />
        </aside>
      </div>
    </div>
  );
}
