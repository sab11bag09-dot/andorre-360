"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type MediaDeleteButtonProps = {
  mediaId: number;
  mediaName: string;
};

export default function MediaDeleteButton({
  mediaId,
  mediaName,
}: MediaDeleteButtonProps) {
  const router = useRouter();

  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    const confirmed = window.confirm(
      `Supprimer définitivement l’image « ${mediaName} » ?`
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/media/${mediaId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Impossible de supprimer cette image."
        );
      }

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Une erreur inattendue est survenue."
      );

      setIsDeleting(false);
    }
  }

return (
  <div className="space-y-2">
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="inline-flex w-full items-center justify-center rounded-lg border border-red-900 px-4 py-2 text-sm font-semibold text-red-400 transition hover:border-red-500 hover:bg-red-950 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isDeleting ? "Suppression…" : "Supprimer"}
    </button>

    {error && (
      <p className="text-xs text-red-400">
        {error}
      </p>
    )}
  </div>
);
}