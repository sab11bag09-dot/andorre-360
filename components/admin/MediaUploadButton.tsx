"use client";

import { ChangeEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type UploadResponse = {
  message?: string;
  error?: string;
};

export default function MediaUploadButton() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [hasError, setHasError] = useState(false);

  function openFileSelector() {
    if (isUploading) {
      return;
    }

    fileInputRef.current?.click();
  }

  async function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsUploading(true);
    setMessage("");
    setHasError(false);

    try {
      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as UploadResponse;

      if (!response.ok) {
        throw new Error(
          data.error || "Le téléversement a échoué.",
        );
      }

      setMessage(
        data.message || "Image téléversée avec succès.",
      );

      router.refresh();
    } catch (error) {
      setHasError(true);

      setMessage(
        error instanceof Error
          ? error.message
          : "Une erreur inconnue est survenue.",
      );
    } finally {
      setIsUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <div className="flex flex-col items-end gap-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        type="button"
        onClick={openFileSelector}
        disabled={isUploading}
        className="inline-flex min-w-48 items-center justify-center rounded-lg bg-yellow-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isUploading
          ? "Téléversement..."
          : "Téléverser une image"}
      </button>

      {message && (
        <p
          className={`max-w-sm text-right text-sm ${
            hasError ? "text-red-400" : "text-green-400"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}