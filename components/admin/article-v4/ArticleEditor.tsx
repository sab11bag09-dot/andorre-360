"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import ArticleContent from "@/components/admin/article/ArticleContent";
import ArticleEditorial from "@/components/admin/article/ArticleEditorial";
import ArticleMedia from "@/components/admin/article/ArticleMedia";
import ArticleSidebar from "@/components/admin/article/ArticleSidebar";

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

  const [draft, setDraft] = useState<ArticleDraft>(() =>
    createArticleDraft(initialValues)
  );

  const [isSaving, setIsSaving] = useState(false);

  const [activeIntent, setActiveIntent] =
    useState<ArticleSubmissionIntent | null>(null);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const wordCount = useMemo(
    () => calculateArticleWordCount(draft.content),
    [draft.content]
  );

  const readingTime = useMemo(() => {
    const readingTimeLabel =
      calculateArticleReadingTime(draft.content);

    const parsedReadingTime = Number.parseInt(
      readingTimeLabel,
      10
    );

    return Number.isNaN(parsedReadingTime)
      ? 1
      : parsedReadingTime;
  }, [draft.content]);

  const selectedZone = useMemo(
    () =>
      EDITORIAL_ZONES.find(
        (editorialZone) =>
          editorialZone.value === draft.zone
      ),
    [draft.zone]
  );

  function clearError() {
    if (errorMessage) {
      setErrorMessage(null);
    }
  }

  function updateField<K extends keyof ArticleDraft>(
    field: K,
    value: ArticleDraft[K]
  ) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }));

    clearError();
  }

  function handleTitleChange(value: string) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      title: value,
      slug: slugifyArticleTitle(value),
    }));

    clearError();
  }

  function handleContentChange(value: string) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      content: value,
      readingTime:
        calculateArticleReadingTime(value),
    }));

    clearError();
  }

  async function handleIntent(
    intent: ArticleSubmissionIntent
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
        error
      );

      setErrorMessage(
        "Une erreur inattendue est survenue pendant la sauvegarde."
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

  const inputClassName =
    "w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/10";

  const secondaryButtonClassName =
    "rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-3 font-semibold text-white transition hover:border-zinc-500 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50";

  const primaryButtonClassName =
    "rounded-xl bg-yellow-500 px-5 py-3 font-semibold text-zinc-950 transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="mx-auto max-w-[1600px]">
      <header className="mb-8 flex flex-col gap-6 border-b border-zinc-800 pb-8 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-yellow-500">
            ANDORRE 360 Studio
          </p>

          <h1 className="mt-3 font-serif text-4xl text-white md:text-5xl">
            {pageTitle}
          </h1>

          <p className="mt-3 max-w-2xl text-zinc-400">
            {pageDescription}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => handleIntent("draft")}
            disabled={isSaving}
            className={secondaryButtonClassName}
          >
            {isSaving && activeIntent === "draft"
              ? "Enregistrement…"
              : "Enregistrer"}
          </button>

          <button
            type="button"
            onClick={() => handleIntent("publish")}
            disabled={isSaving}
            className={primaryButtonClassName}
          >
            {isSaving && activeIntent === "publish"
              ? "Publication…"
              : "Publier"}
          </button>
        </div>
      </header>

      {errorMessage && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-4 text-sm text-red-200"
        >
          <p className="font-semibold">
            La sauvegarde a échoué
          </p>

          <p className="mt-1">{errorMessage}</p>
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

              <select
                id="contentType"
                value={draft.contentType}
                onChange={(event) =>
                  updateField(
                    "contentType",
                    event.target
                      .value as ArticleContentType
                  )
                }
                disabled={isSaving}
                className={inputClassName}
              >
                {CONTENT_TYPES.map((contentType) => (
                  <option
                    key={contentType.value}
                    value={contentType.value}
                  >
                    {contentType.label}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <ArticleContent
            title={draft.title}
            setTitle={handleTitleChange}
            category={draft.category}
            setCategory={(value) =>
              updateField("category", value)
            }
            author={draft.author}
            setAuthor={(value) =>
              updateField("author", value)
            }
            description={draft.description}
            setDescription={(value) =>
              updateField("description", value)
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
              updateField("videoUrl", value)
            }
            videoDuration={draft.videoDuration}
            setVideoDuration={(value) =>
              updateField(
                "videoDuration",
                value
              )
            }
          />
        </div>

        <aside className="space-y-8 xl:sticky xl:top-6">
          <ArticleEditorial
            pageKey={draft.pageKey}
            setPageKey={(value) =>
              updateField("pageKey", value)
            }
            zone={draft.zone}
            setZone={(value) =>
              updateField("zone", value)
            }
            priority={String(draft.priority)}
            setPriority={(value) => {
              const parsedPriority =
                Number.parseInt(value, 10);

              updateField(
                "priority",
                Number.isNaN(parsedPriority)
                  ? 0
                  : parsedPriority
              );
            }}
            channel={draft.channel}
            setChannel={(value) =>
              updateField(
                "channel",
                value as ArticleDraft["channel"]
              )
            }
            startsAt={draft.startsAt}
            setStartsAt={(value) =>
              updateField("startsAt", value)
            }
            endsAt={draft.endsAt}
            setEndsAt={(value) =>
              updateField("endsAt", value)
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
              updateField("featured", value)
            }
          />
        </aside>
      </div>
    </div>
  );
}