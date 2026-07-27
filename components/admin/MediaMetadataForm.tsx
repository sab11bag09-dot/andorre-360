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
  initialTitle: string | null;
  initialAlt: string | null;
  initialCaption: string | null;
  initialCredit: string | null;
  initialCopyright: string | null;
};

export default function MediaMetadataForm({
  mediaId,
  initialTitle,
  initialAlt,
  initialCaption,
  initialCredit,
  initialCopyright,
}: MediaMetadataFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialTitle ?? "");
  const [alt, setAlt] = useState(initialAlt ?? "");
  const [caption, setCaption] = useState(
    initialCaption ?? ""
  );
  const [credit, setCredit] = useState(
    initialCredit ?? ""
  );
  const [copyright, setCopyright] = useState(
    initialCopyright ?? ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [hasError, setHasError] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setIsSaving(true);
    setMessage("");
    setHasError(false);

    try {
      const response = await fetch(`/api/media/${mediaId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          alt,
          caption,
          credit,
          copyright,
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
      setHasError(true);
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
        <label
          htmlFor={`media-title-${mediaId}`}
          className="mb-1 block text-xs text-zinc-400"
        >
          Titre
        </label>

        <Input
          id={`media-title-${mediaId}`}
          value={title}
          onChange={(event) =>
            setTitle(event.target.value)
          }
          className="mt-0"
        />
      </div>

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

      <div>
        <label
          htmlFor={`media-credit-${mediaId}`}
          className="mb-1 block text-xs text-zinc-400"
        >
          Crédit
        </label>

        <Input
          id={`media-credit-${mediaId}`}
          value={credit}
          onChange={(event) =>
            setCredit(event.target.value)
          }
          className="mt-0"
        />
      </div>

      <div>
        <label
          htmlFor={`media-copyright-${mediaId}`}
          className="mb-1 block text-xs text-zinc-400"
        >
          Copyright
        </label>

        <Input
          id={`media-copyright-${mediaId}`}
          value={copyright}
          onChange={(event) =>
            setCopyright(event.target.value)
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
        <p
          className={`text-center text-xs ${
            hasError
              ? "text-red-400"
              : "text-green-400"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}