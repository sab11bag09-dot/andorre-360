"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { createArticle } from "@/actions/articles";

import ArticleContent from "@/components/admin/article-v5/ArticleContent";
import ArticleEditorial from "./ArticleEditorial";
import ArticleMedia from "./ArticleMedia";
import ArticleSidebar from "./ArticleSidebar";

import {
  EDITORIAL_ZONES,
  EMPTY_ARTICLE_VALUES,
  calculateReadingTime,
  calculateWordCount,
  slugify,
} from "./types";

import type {
  ArticleEditorMode,
  ArticleEditorValues,
} from "./types";

type Props = {
  mode: ArticleEditorMode;
  initialValues?: ArticleEditorValues;
};

export default function ArticleEditor({
  mode,
  initialValues = EMPTY_ARTICLE_VALUES,
}: Props) {
  // Contenu
  const [title, setTitle] = useState(initialValues.title);
  const [category, setCategory] = useState(initialValues.category);
  const [author, setAuthor] = useState(initialValues.author);
  const [description, setDescription] = useState(
    initialValues.description
  );
  const [content, setContent] = useState(initialValues.content);

  // Média
  const [image, setImage] = useState(initialValues.image);
  const [contentType] = useState(initialValues.contentType);
  const [videoUrl, setVideoUrl] = useState(initialValues.videoUrl);
  const [videoDuration, setVideoDuration] = useState(
    initialValues.videoDuration
  );

  // Mission éditoriale
  const [pageKey, setPageKey] = useState(initialValues.pageKey);
  const [zone, setZone] = useState(initialValues.zone);
  const [priority, setPriority] = useState(initialValues.priority);
  const [channel, setChannel] = useState(initialValues.channel);
  const [startsAt, setStartsAt] = useState(initialValues.startsAt);
  const [endsAt, setEndsAt] = useState(initialValues.endsAt);

  // Compatibilité
  const [featured, setFeatured] = useState(initialValues.featured);

  const slug = useMemo(() => slugify(title), [title]);

  const wordCount = useMemo(
    () => calculateWordCount(content),
    [content]
  );

  const readingTime = useMemo(
    () => calculateReadingTime(content),
    [content]
  );

  const selectedZone = useMemo(
    () =>
      EDITORIAL_ZONES.find(
        (editorialZone) => editorialZone.value === zone
      ),
    [zone]
  );

  return (
    <form action={createArticle} className="space-y-8">
      {/*
        Ces champs cachés garantissent que toutes les valeurs
        contrôlées par React sont envoyées à la Server Action.
      */}

      <input type="hidden" name="title" value={title} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="category" value={category} />
      <input type="hidden" name="author" value={author} />
      <input
        type="hidden"
        name="description"
        value={description}
      />
      <input type="hidden" name="content" value={content} />

      <input type="hidden" name="image" value={image} />
      <input
        type="hidden"
        name="contentType"
        value={contentType}
      />
      <input
        type="hidden"
        name="videoUrl"
        value={videoUrl}
      />
      <input
        type="hidden"
        name="videoDuration"
        value={videoDuration}
      />

      <input type="hidden" name="pageKey" value={pageKey} />
      <input type="hidden" name="zone" value={zone} />
      <input
        type="hidden"
        name="priority"
        value={priority}
      />
      <input type="hidden" name="channel" value={channel} />
      <input
        type="hidden"
        name="startsAt"
        value={startsAt}
      />
      <input type="hidden" name="endsAt" value={endsAt} />

      <input
        type="hidden"
        name="readingTime"
        value={`${readingTime} min`}
      />

      {featured && (
        <input type="hidden" name="featured" value="on" />
      )}

      <header className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 text-white">
        <h1 className="text-3xl font-bold">
          {mode === "create"
            ? "Nouvel article"
            : "Modifier l'article"}
        </h1>

        <p className="mt-3 text-zinc-400">
          Studio V3
        </p>
      </header>

      <div className="grid gap-8 xl:grid-cols-3">
        <div className="space-y-8 xl:col-span-2">
          <ArticleContent
            title={title}
            setTitle={setTitle}
            category={category}
            setCategory={setCategory}
            author={author}
            setAuthor={setAuthor}
            description={description}
            setDescription={setDescription}
            content={content}
            setContent={setContent}
            wordCount={wordCount}
            readingTime={readingTime}
          />

          <ArticleMedia
            image={image}
            setImage={setImage}
            contentType={contentType}
            videoUrl={videoUrl}
            setVideoUrl={setVideoUrl}
            videoDuration={videoDuration}
            setVideoDuration={setVideoDuration}
          />
        </div>

        <aside className="space-y-8">
          <ArticleEditorial
            pageKey={pageKey}
            setPageKey={setPageKey}
            zone={zone}
            setZone={setZone}
            priority={priority}
            setPriority={setPriority}
            channel={channel}
            setChannel={setChannel}
            startsAt={startsAt}
            setStartsAt={setStartsAt}
            endsAt={endsAt}
            setEndsAt={setEndsAt}
          />

          <ArticleSidebar
            contentType={contentType}
            slug={slug}
            wordCount={wordCount}
            readingTime={readingTime}
            pageKey={pageKey}
            zoneLabel={selectedZone?.label ?? zone}
            featured={featured}
            setFeatured={setFeatured}
          />
        </aside>
      </div>

      <footer className="sticky bottom-4 z-20 rounded-2xl border border-zinc-200 bg-white/95 p-4 shadow-xl backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-zinc-900">
              Actions de l’article
            </p>

            <p className="text-sm text-zinc-500">
              Enregistrez un brouillon ou publiez immédiatement
              l’article.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/admin"
              className="rounded-xl border border-zinc-300 px-5 py-3 text-center text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
            >
              Annuler
            </Link>

            <button
              type="submit"
              name="submissionIntent"
              value="draft"
              className="rounded-xl border border-zinc-900 px-5 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100"
            >
              Enregistrer
            </button>

            <button
              type="submit"
              name="submissionIntent"
              value="publish"
              className="rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-yellow-600"
            >
              Publier
            </button>
          </div>
        </div>
      </footer>
    </form>
  );
}