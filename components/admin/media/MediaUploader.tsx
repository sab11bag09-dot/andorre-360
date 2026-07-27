"use client";

import { ChangeEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, LoaderCircle, Upload } from "lucide-react";

type UploadResponse = {
  success?: boolean;
  error?: string;
};

export function MediaUploader() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadFile(file: File) {
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });

      const result = (await response.json()) as UploadResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          result.error ?? "L’image n’a pas pu être importée.",
        );
      }

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      router.refresh();
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Une erreur est survenue pendant l’import.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  async function handleChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    await uploadFile(file);
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleChange}
        disabled={isUploading}
        className="hidden"
      />

      <button
        type="button"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isUploading ? (
          <>
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Import en cours
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            Importer une image
          </>
        )}
      </button>

      {error && (
        <div className="max-w-sm rounded-lg border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      {!error && !isUploading && (
        <p className="flex items-center gap-1 text-xs text-zinc-500">
          <ImagePlus className="h-3.5 w-3.5" />
          JPEG, PNG, WebP ou GIF
        </p>
      )}
    </div>
  );
}