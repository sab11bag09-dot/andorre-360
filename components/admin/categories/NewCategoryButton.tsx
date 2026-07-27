"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NewCategoryButton() {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.error ??
            "Impossible de créer la catégorie."
        );
        return;
      }

      setName("");
      setDescription("");
      setIsOpen(false);
      router.refresh();
    } catch {
      setError("Une erreur réseau est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) {
    return (
      <Button
        type="button"
        onClick={() => setIsOpen(true)}
        className="bg-white text-black hover:bg-zinc-200"
      >
        <Plus />
        Nouvelle catégorie
      </Button>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <div>
          <label
            htmlFor="category-name"
            className="mb-2 block text-sm font-medium text-white"
          >
            Nom
          </label>

          <input
            id="category-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            placeholder="Exemple : Culture"
            className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-400"
          />
        </div>

        <div>
          <label
            htmlFor="category-description"
            className="mb-2 block text-sm font-medium text-white"
          >
            Description
          </label>

          <textarea
            id="category-description"
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            rows={4}
            placeholder="Description facultative"
            className="w-full resize-none rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-400"
          />
        </div>

        {error ? (
          <p className="text-sm text-red-400">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-white text-black hover:bg-zinc-200"
          >
            {isSubmitting
              ? "Création..."
              : "Créer la catégorie"}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsOpen(false);
              setError("");
            }}
          >
            Annuler
          </Button>
        </div>
      </form>
    </div>
  );
}