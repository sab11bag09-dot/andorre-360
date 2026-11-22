"use client";

import { useState, useTransition } from "react";

import { updateFilInfoSettings } from "@/actions/fil-info";
import { Button } from "@/components/admin/ui";
import {
  getFilInfoFormatLabel,
  type FilInfoFormat,
} from "@/lib/fil-info-format";

type Props = {
  articleId: number;
  title: string;
  description: string;
  format: FilInfoFormat;
  initialVisible: boolean;
  initialPinned: boolean;
  initialPublishedAt: string;
  initialUpdatedAt: string;
  published: boolean;
  editorialStatus: string;
};

function toDateTimeLocal(value: string): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset() * 60_000;

  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export default function FilInfoAdminControls({
  articleId,
  title,
  description,
  format,
  initialVisible,
  initialPinned,
  initialPublishedAt,
  initialUpdatedAt,
  published,
  editorialStatus,
}: Props) {
  const [visible, setVisible] = useState(initialVisible);
  const [pinned, setPinned] = useState(initialPinned);
  const [publishedAt, setPublishedAt] = useState(() =>
    toDateTimeLocal(initialPublishedAt),
  );
  const [expectedUpdatedAt, setExpectedUpdatedAt] = useState(initialUpdatedAt);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const canExpose = published && editorialStatus === "PUBLISHED";
  const isAlert = format === "ALERT";

  function handleVisibleChange(nextVisible: boolean) {
    setVisible(nextVisible);

    if (!nextVisible) {
      setPinned(false);
    }
  }

  function saveSettings() {
    setMessage(null);

    startTransition(async () => {
      const result = await updateFilInfoSettings({
        articleId,
        visible,
        pinned,
        publishedAt: new Date(publishedAt).toISOString(),
        expectedUpdatedAt,
      });

      if (!result.success) {
        setMessage(result.message);
        return;
      }

      setVisible(result.visible);
      setPinned(result.pinned);
      setPublishedAt(toDateTimeLocal(result.publishedAt));
      setExpectedUpdatedAt(result.updatedAt);
      setMessage("Réglages du Fil info enregistrés.");
    });
  }

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
      <div className="border-b border-zinc-800 pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-500">
          Fil info
        </p>
        <h2 className="mt-2 font-serif text-2xl text-white">
          Administration du flux
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Ces réglages sont enregistrés séparément et ne changent pas le statut
          éditorial de l’article.
        </p>
      </div>

      {!canExpose && (
        <p className="mt-5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Publie et approuve l’article avant de l’exposer ou de l’épingler.
        </p>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="flex items-start gap-3 rounded-lg border border-zinc-800 p-4">
          <input
            type="checkbox"
            checked={visible && canExpose}
            onChange={(event) => handleVisibleChange(event.target.checked)}
            disabled={isPending || !canExpose}
            className="mt-1"
          />
          <span>
            <span className="block font-semibold text-zinc-100">
              Afficher dans le Fil info
            </span>
            <span className="mt-1 block text-xs leading-5 text-zinc-500">
              Le retrait conserve la page publique de l’article.
            </span>
          </span>
        </label>

        <label className="flex items-start gap-3 rounded-lg border border-zinc-800 p-4">
          <input
            type="checkbox"
            checked={pinned && visible && canExpose}
            onChange={(event) => setPinned(event.target.checked)}
            disabled={isPending || !canExpose || !visible}
            className="mt-1"
          />
          <span>
            <span className="block font-semibold text-zinc-100">
              Épingler en tête
            </span>
            <span className="mt-1 block text-xs leading-5 text-zinc-500">
              Un nouvel épinglage remplace automatiquement l’ancien.
            </span>
          </span>
        </label>
      </div>

      <label className="mt-5 block">
        <span className="mb-2 block font-semibold text-zinc-200">
          Date de publication dans le flux
        </span>
        <input
          type="datetime-local"
          value={publishedAt}
          onChange={(event) => setPublishedAt(event.target.value)}
          disabled={isPending || !canExpose}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
        />
        <span className="mt-2 block text-xs text-zinc-500">
          Elle ne change que lorsque tu enregistres explicitement ce panneau.
        </span>
      </label>

      <div className="mt-6 overflow-hidden rounded-xl border border-zinc-700">
        <div className="bg-zinc-950 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
          Aperçu · {getFilInfoFormatLabel(format)}
        </div>
        <div
          className={`px-5 py-5 ${
            isAlert ? "bg-yellow-500 text-black" : "bg-neutral-950 text-white"
          }`}
        >
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-60">
            {pinned ? "Épinglé · " : ""}{getFilInfoFormatLabel(format)}
          </p>
          <h3 className="mt-2 font-serif text-xl">{title || "Titre de l’article"}</h3>
          {format === "BRIEF" && description && (
            <p className="mt-3 line-clamp-2 text-sm opacity-70">{description}</p>
          )}
        </div>
      </div>

      {message && (
        <p className="mt-4 text-sm text-zinc-300" role="status">
          {message}
        </p>
      )}

      <div className="mt-5 flex justify-end">
        <Button
          type="button"
          onClick={saveSettings}
          disabled={isPending || !canExpose || !publishedAt}
        >
          {isPending ? "Enregistrement…" : "Enregistrer les réglages du Fil info"}
        </Button>
      </div>
    </section>
  );
}
