"use client";

import {
  useCallback,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type DragEvent,
} from "react";

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

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

export default function ImageBlockEditor({
  src,
  alt,
  caption,
  credit,
  onChange,
}: Props) {
  const inputId = useId();
  const altId = useId();
  const captionId = useId();
  const creditId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const updateField = useCallback(
    <K extends keyof ImageBlockValue>(
      field: K,
      value: ImageBlockValue[K]
    ) => {
      onChange({
        src,
        alt,
        caption,
        credit,
        [field]: value,
      });
    },
    [alt, caption, credit, onChange, src]
  );

  const validateFile = useCallback((file: File) => {
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      throw new Error(
        "Format non autorisé. Utilisez une image JPG, PNG, WebP, GIF ou AVIF."
      );
    }

    if (file.size === 0) {
      throw new Error("Le fichier sélectionné est vide.");
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error("L’image ne doit pas dépasser 10 Mo.");
    }
  }, []);

  const uploadFile = useCallback(
    async (file: File) => {
      setUploadError("");
      setIsUploading(true);

      try {
        validateFile(file);

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload/image", {
          method: "POST",
          body: formData,
        });

        let data: UploadResponse;

        try {
          data = (await response.json()) as UploadResponse;
        } catch {
          throw new Error(
            "Le serveur a renvoyé une réponse invalide."
          );
        }

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
    },
    [updateField, validateFile]
  );

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (file) {
      void uploadFile(file);
    }
  }

  function handleDragEnter(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (!isUploading) {
      setIsDragging(true);
    }
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (!isUploading) {
      event.dataTransfer.dropEffect = "copy";
      setIsDragging(true);
    }
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (event.currentTarget.contains(event.relatedTarget as Node)) {
      return;
    }

    setIsDragging(false);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(false);

    if (isUploading) {
      return;
    }

    const file = event.dataTransfer.files?.[0];

    if (file) {
      void uploadFile(file);
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    if (isUploading) {
      return;
    }

    const clipboardItems = Array.from(
      event.clipboardData.items
    );

    const imageItem = clipboardItems.find((item) =>
      item.type.startsWith("image/")
    );

    if (!imageItem) {
      return;
    }

    const file = imageItem.getAsFile();

    if (!file) {
      return;
    }

    event.preventDefault();
    void uploadFile(file);
  }

  function openFilePicker() {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  }

  function removeImage() {
    setUploadError("");
    updateField("src", "");
  }

  const hasImage = src.trim().length > 0;

  return (
    <div
      className="space-y-5"
      onPaste={handlePaste}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        onChange={handleFileChange}
        disabled={isUploading}
        className="hidden"
      />

      <div>
        <p className="mb-2 text-sm font-semibold text-zinc-200">
          Image
        </p>

        {!hasImage ? (
          <div
            onClick={openFilePicker}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" ||
                event.key === " "
              ) {
                event.preventDefault();
                openFilePicker();
              }
            }}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            role="button"
            tabIndex={isUploading ? -1 : 0}
            aria-disabled={isUploading}
            className={[
              "flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center outline-none transition",
              isDragging
                ? "border-yellow-400 bg-yellow-400/10"
                : "border-zinc-700 bg-zinc-950 hover:border-yellow-500 hover:bg-zinc-900",
              isUploading
                ? "cursor-not-allowed opacity-60"
                : "focus:border-yellow-500",
            ].join(" ")}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 text-2xl">
              {isUploading ? "…" : "↑"}
            </div>

            <p className="font-semibold text-white">
              {isUploading
                ? "Envoi de l’image en cours…"
                : isDragging
                  ? "Déposez l’image ici"
                  : "Choisir ou déposer une image"}
            </p>

            <p className="mt-2 max-w-md text-sm text-zinc-400">
              Vous pouvez également coller une image avec
              {" "}
              <kbd className="rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 text-xs text-zinc-300">
                Ctrl
              </kbd>
              {" + "}
              <kbd className="rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 text-xs text-zinc-300">
                V
              </kbd>
              {" "}
              ou
              {" "}
              <kbd className="rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 text-xs text-zinc-300">
                ⌘
              </kbd>
              {" + "}
              <kbd className="rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 text-xs text-zinc-300">
                V
              </kbd>
              .
            </p>

            <p className="mt-3 text-xs text-zinc-500">
              JPG, PNG, WebP, GIF ou AVIF — 10 Mo maximum
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
            <div
              className="aspect-video w-full bg-contain bg-center bg-no-repeat"
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

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 p-4">
              <p className="min-w-0 flex-1 truncate text-xs text-zinc-500">
                {src}
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={openFilePicker}
                  disabled={isUploading}
                  className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm font-semibold text-white transition hover:border-yellow-500 hover:text-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUploading
                    ? "Envoi…"
                    : "Remplacer"}
                </button>

                <button
                  type="button"
                  onClick={removeImage}
                  disabled={isUploading}
                  className="rounded-lg border border-red-900/80 bg-red-950/40 px-3 py-2 text-sm font-semibold text-red-300 transition hover:border-red-500 hover:bg-red-950/70 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}

        {uploadError && (
          <div
            role="alert"
            className="mt-3 rounded-lg border border-red-900/80 bg-red-950/40 px-4 py-3 text-sm text-red-300"
          >
            {uploadError}
          </div>
        )}
      </div>

      <div>
        <label
          htmlFor={inputId}
          className="mb-2 block text-sm font-semibold text-zinc-200"
        >
          Adresse de l’image
        </label>

        <input
          id={inputId}
          type="text"
          value={src}
          onChange={(event) =>
            updateField("src", event.target.value)
          }
          placeholder="/uploads/mon-image.jpg ou https://…"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500"
        />

        <p className="mt-2 text-xs text-zinc-500">
          Cette adresse est remplie automatiquement après
          l’envoi, mais vous pouvez aussi saisir une URL.
        </p>
      </div>

      <div>
        <label
          htmlFor={altId}
          className="mb-2 block text-sm font-semibold text-zinc-200"
        >
          Texte alternatif
        </label>

        <input
          id={altId}
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
            htmlFor={captionId}
            className="mb-2 block text-sm font-semibold text-zinc-200"
          >
            Légende
          </label>

          <input
            id={captionId}
            type="text"
            value={caption}
            onChange={(event) =>
              updateField("caption", event.target.value)
            }
            placeholder="Légende facultative"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500"
          />
        </div>

        <div>
          <label
            htmlFor={creditId}
            className="mb-2 block text-sm font-semibold text-zinc-200"
          >
            Crédit photo
          </label>

          <input
            id={creditId}
            type="text"
            value={credit}
            onChange={(event) =>
              updateField("credit", event.target.value)
            }
            placeholder="Photographe ou source"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500"
          />
        </div>
      </div>
    </div>
  );
}