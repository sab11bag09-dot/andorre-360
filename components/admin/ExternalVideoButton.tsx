"use client";

import { useState } from "react";

export default function ExternalVideoButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState("");

  async function handleAdd() {
    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      window.alert("Veuillez saisir une URL.");
      return;
    }

    try {
      const response = await fetch("/api/external-videos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: trimmedUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        window.alert(data.error ?? "Une erreur est survenue.");
        return;
      }

      setUrl("");
      setIsOpen(false);

      window.alert("Vidéo externe ajoutée avec succès.");
    } catch (error) {
      console.error(error);
      window.alert("Impossible de contacter le serveur.");
    }
  }

  function handleCancel() {
    setUrl("");
    setIsOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-white transition hover:border-yellow-500 hover:text-yellow-400"
      >
        Ajouter une vidéo externe
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-xl border border-gray-800 bg-zinc-950 p-6">
            <h2 className="text-lg font-semibold text-white">
              Ajouter une vidéo externe
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Colle un lien YouTube, TikTok, Facebook ou Vimeo.
            </p>

            <input
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://..."
              className="mt-4 w-full rounded-lg border border-gray-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-yellow-500"
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-white"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={handleAdd}
                className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-black"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}