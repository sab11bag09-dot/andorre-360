"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { replacePublication } from "@/actions/publications";
import type { EditorialZone } from "@/lib/editorial/zones";

type ReplaceArticle = {
  id: number;
  title: string;
  category: string;
  author: string;
};

type ReplaceDialogProps = {
  open: boolean;
  onClose: () => void;
  editionKey: string;
  zone: EditorialZone;
  articles: ReplaceArticle[];
};

export default function ReplaceDialog({
  open,
  onClose,
  editionKey,
  zone,
  articles,
}: ReplaceDialogProps) {
  const router = useRouter();

  const [selectedArticleId, setSelectedArticleId] =
    useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return null;
  }

  const filteredArticles = articles.filter((article) => {
    const searchValue = search.toLowerCase();

    return (
      article.title.toLowerCase().includes(searchValue) ||
      article.category.toLowerCase().includes(searchValue) ||
      article.author.toLowerCase().includes(searchValue)
    );
  });

  function handleReplace() {
    if (!selectedArticleId) {
      setMessage("Choisis d’abord un article.");
      return;
    }

    setMessage("");

    startTransition(async () => {
      const result = await replacePublication({
        articleId: selectedArticleId,
        pageKey: editionKey,
        zone,
        channel: "site",
        priority: 20,
      });

      if (!result.success) {
        setMessage(result.message);
        return;
      }

      router.refresh();
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* EN-TÊTE */}

        <div className="flex items-start justify-between border-b border-gray-200 px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-yellow-600">
              Centre éditorial
            </p>

            <h2 className="mt-2 font-serif text-3xl text-gray-900">
              Remplacer le contenu
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Zone : <strong>{zone}</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        {/* RECHERCHE */}

        <div className="border-b border-gray-200 px-6 py-4">
          <label
            htmlFor="replace-search"
            className="sr-only"
          >
            Rechercher un article
          </label>

          <input
            id="replace-search"
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Rechercher par titre, rubrique ou auteur..."
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-yellow-500"
          />
        </div>

        {/* LISTE DES ARTICLES */}

        <div className="max-h-[50vh] overflow-y-auto px-6 py-5">
          {filteredArticles.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
              Aucun article trouvé.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredArticles.map((article) => {
                const selected =
                  selectedArticleId === article.id;

                return (
                  <button
                    key={article.id}
                    type="button"
                    onClick={() =>
                      setSelectedArticleId(article.id)
                    }
                    className={`w-full rounded-xl border p-4 text-left transition ${
                      selected
                        ? "border-yellow-500 bg-yellow-50"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <p className="text-xs font-bold uppercase tracking-widest text-yellow-600">
                      {article.category}
                    </p>

                    <h3 className="mt-2 font-semibold text-gray-900">
                      {article.title}
                    </h3>

                    <p className="mt-2 text-sm text-gray-500">
                      Par {article.author}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* MESSAGE */}

        {message && (
          <div className="mx-6 mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {message}
          </div>
        )}

        {/* ACTIONS */}

        <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={handleReplace}
            disabled={isPending || !selectedArticleId}
            className="rounded-xl bg-black px-5 py-3 font-semibold text-white transition hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isPending
              ? "Remplacement..."
              : "Confirmer le remplacement"}
          </button>
        </div>
      </div>
    </div>
  );
}