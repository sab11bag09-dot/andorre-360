"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/admin/ui";

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
   <Button
  type="button"
  variant="danger"
  onClick={handleDelete}
  disabled={isDeleting}
  className="w-full"
>
  {isDeleting ? "Suppression…" : "Supprimer"}
</Button>

    {error && (
      <p className="text-xs text-red-400">
        {error}
      </p>
    )}
  </div>
);
}