"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type MediaMetadataFormProps = {
  mediaId: number;
  initialAlt: string | null;
  initialCaption: string | null;
};

export default function MediaMetadataForm({
  mediaId,
  initialAlt,
  initialCaption,
}: MediaMetadataFormProps) {
  const router = useRouter();

  const [alt, setAlt] = useState(initialAlt ?? "");
  const [caption, setCaption] = useState(initialCaption ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setIsSaving(true);
    setMessage("");

    try {
      const response = await fetch(`/api/media/${mediaId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          alt,
          caption,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Impossible d'enregistrer."
        );
      }

      setMessage("Enregistré ✔");

      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Erreur inconnue."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 border-t border-zinc-800 pt-3"
    >
      <div>
        <label className="mb-1 block text-xs text-zinc-400">
          Texte alternatif
        </label>

        <input
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs text-zinc-400">
          Légende
        </label>

        <textarea
          rows={2}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
        />
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="w-full rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-400 disabled:opacity-50"
      >
        {isSaving ? "Enregistrement..." : "Enregistrer"}
      </button>

      {message && (
        <p className="text-center text-xs text-green-400">
          {message}
        </p>
      )}
    </form>
  );
}