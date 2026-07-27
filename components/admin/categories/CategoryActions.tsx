"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

type CategoryActionsProps = {
  id: number;
  name: string;
  description: string | null;
};

export default function CategoryActions({
  id,
  name,
  description,
}: CategoryActionsProps) {
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(name);
  const [editedDescription, setEditedDescription] = useState(
    description ?? ""
  );

  if (isEditing) {
    return (
      <div className="min-w-72 space-y-3">
        <input
          value={editedName}
          onChange={(event) => setEditedName(event.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white outline-none focus:border-zinc-400"
        />

        <textarea
          value={editedDescription}
          onChange={(event) =>
            setEditedDescription(event.target.value)
          }
          rows={3}
          className="w-full resize-none rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white outline-none focus:border-zinc-400"
        />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            size="sm"
            className="bg-white text-black hover:bg-zinc-200"
            onClick={async () => {
  const response = await fetch(`/api/categories/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: editedName,
      description: editedDescription,
    }),
  });

  if (!response.ok) {
    alert("Impossible de modifier la catégorie.");
    return;
  }

  setIsEditing(false);
  router.refresh();
}}
          >
            Enregistrer
          </Button>

          <Button
            type="button"
            size="sm"
            className="border border-zinc-600 bg-zinc-900 text-white hover:bg-zinc-800"
            onClick={() => {
              setEditedName(name);
              setEditedDescription(description ?? "");
              setIsEditing(false);
              router.refresh();
            }}
          >
            Annuler
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-end gap-2">
      <Button
        type="button"
        size="sm"
        className="border border-zinc-600 bg-zinc-900 text-white hover:bg-zinc-800"
        onClick={() => setIsEditing(true)}
      >
        Modifier
      </Button>

      <Button
        type="button"
        size="sm"
        className="border border-red-900 bg-red-950 text-red-300 hover:bg-red-900"
       onClick={async () => {
  const confirmed = window.confirm(
    `Supprimer définitivement la catégorie « ${name} » ?`
  );

  if (!confirmed) {
    return;
  }

  const response = await fetch(`/api/categories/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    alert("Impossible de supprimer la catégorie.");
    return;
  }

  router.refresh();
}}
      >
        Supprimer
      </Button>
    </div>
  );
}