"use client";

import { useRef, useState } from "react";

type ImageBlockValue = {
  src: string;
  alt: string;
  caption: string;
  credit: string;
};

type Props = ImageBlockValue & {
  onChange: (value: ImageBlockValue) => void;
};

type UploadResponse = {
  success: boolean;
  src?: string;
  error?: string;
};

export default function ImageBlockEditor({
  src,
  alt,
  caption,
  credit,
  onChange,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  function updateField<K extends keyof ImageBlockValue>(
    field: K,
    value: ImageBlockValue[K]
  ) {
    onChange({
      src,
      alt,
      caption,
      credit,
      [field]: value,
    });
  }

  async function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as UploadResponse;

      if (!response.ok || !data.success || !data.src) {
        throw new Error(
          data.error || "Impossible d’envoyer l’image."
        );
      }

      updateField("src", data.src);
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue pendant l’envoi."
      );
    } finally {
      setIsUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 block text-sm font-semibold text-zinc-200">
          Importer une image
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:border-yellow-500 hover:text-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isUploading
            ? "Envoi en cours…"
            : "Choisir une image"}
        </button>

        {uploadError && (
          <p className="mt-2 text-sm text-red-400">
            {uploadError}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="image-src"
          className="mb-2 block text-sm font-semibold text-zinc-200"
        >
          Adresse de l’image
        </label>

        <input
          id="image-src"
          type="text"
          value={src}
          onChange={(event) =>
            updateField("src", event.target.value)
          }
          placeholder="/uploads/mon-image.jpg ou https://…"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500"
        />
      </div>

      {src.trim() && (
        <div
          className="aspect-video w-full rounded-xl border border-zinc-800 bg-zinc-950 bg-contain bg-center bg-no-repeat"
          style={{
            backgroundImage: `url("${src.replace(
              /["\\]/g,
              "\\$&"
            )}")`,
          }}
          role="img"
          aria-label={
            alt.trim() || "Aperçu de l’image"
          }
        />
      )}

      <div>
        <label
          htmlFor="image-alt"
          className="mb-2 block text-sm font-semibold text-zinc-200"
        >
          Texte alternatif
        </label>

        <input
          id="image-alt"
          type="text"
          value={alt}
          onChange={(event) =>
            updateField("alt", event.target.value)
          }
          placeholder="Décrivez l’image pour l’accessibilité"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500"
        />

        <p className="mt-2 text-xs text-zinc-500">
          Décrivez brièvement ce que montre l’image.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label
            htmlFor="image-caption"
            className="mb-2 block text-sm font-semibold text-zinc-200"
          >
            Légende
          </label>

          <input
            id="image-caption"
            type="text"
            value={caption}
            onChange={(event) =>
              updateField(
                "caption",
                event.target.value
              )
            }
            placeholder="Légende facultative"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500"
          />
        </div>

        <div>
          <label
            htmlFor="image-credit"
            className="mb-2 block text-sm font-semibold text-zinc-200"
          >
            Crédit photo
          </label>

          <input
            id="image-credit"
            type="text"
            value={credit}
            onChange={(event) =>
              updateField(
                "credit",
                event.target.value
              )
            }
            placeholder="Photographe ou source"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500"
          />
        </div>
      </div>
    </div>
  );
}