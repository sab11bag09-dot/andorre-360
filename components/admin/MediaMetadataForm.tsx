"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Input,
  Textarea,
} from "@/components/admin/ui";

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
    event: React.FormEvent<HTMLFormElement>,
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
          data.error || "Impossible d'enregistrer.",
        );
      }

      setMessage("Enregistré ✔");
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Erreur inconnue.",
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
        <label
          htmlFor={`media-alt-${mediaId}`}
          className="mb-1 block text-xs text-zinc-400"
        >
          Texte alternatif
        </label>

        <Input
          id={`media-alt-${mediaId}`}
          value={alt}
          onChange={(event) =>
            setAlt(event.target.value)
          }
          className="mt-0"
        />
      </div>

      <div>
        <label
          htmlFor={`media-caption-${mediaId}`}
          className="mb-1 block text-xs text-zinc-400"
        >
          Légende
        </label>

        <Textarea
          id={`media-caption-${mediaId}`}
          rows={2}
          value={caption}
          onChange={(event) =>
            setCaption(event.target.value)
          }
          className="mt-0"
        />
      </div>

      <Button
        type="submit"
        disabled={isSaving}
        className="w-full"
      >
        {isSaving
          ? "Enregistrement..."
          : "Enregistrer"}
      </Button>

      {message && (
        <p className="text-center text-xs text-green-400">
          {message}
        </p>
      )}
    </form>
  );
}