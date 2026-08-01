"use client";

import { ChangeEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/admin/ui";

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
        data.message || "Média téléversé avec succès.",
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
        accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
        onChange={handleFileChange}
        className="hidden"
      />

      <Button
  type="button"
  onClick={openFileSelector}
  disabled={isUploading}
  className="min-w-48"
>
  {isUploading
    ? "Téléversement..."
    : "Téléverser un média"}
</Button>

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