"use client";

import { useEffect, useState } from "react";

type MediaItem = {
  id: number;
  filename: string;
  originalName: string;
  path: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  alt: string | null;
  caption: string | null;
  createdAt: string;
};

type MediaPickerProps = {
  value: string;
  onChange: (path: string) => void;
};

export default function MediaPicker({
  value,
  onChange,
}: MediaPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    async function loadMedia() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch("/api/media");

        const data = (await response.json()) as {
          media?: MediaItem[];
          error?: string;
        };

        if (!response.ok) {
          throw new Error(
            data.error || "Impossible de charger les médias.",
          );
        }

        setMedia(data.media || []);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Une erreur inconnue est survenue.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadMedia();
  }, [isOpen]);

  function selectMedia(path: string) {
    onChange(path);
    setIsOpen(false);
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center justify-center rounded-lg bg-yellow-500 px-5 py-3 font-semibold text-black transition hover:bg-yellow-400"
        >
          Choisir une image
        </button>

        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="inline-flex items-center justify-center rounded-lg border border-zinc-700 px-5 py-3 font-semibold text-zinc-300 transition hover:border-red-500 hover:text-red-400"
          >
            Retirer l’image
          </button>
        )}
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="media-picker-title"
        >
          <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-950 shadow-2xl">
            <header className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-500">
                  ANDORRE 360 Studio
                </p>

                <h2
                  id="media-picker-title"
                  className="mt-2 font-serif text-2xl text-white"
                >
                  Choisir une image
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-zinc-500 hover:text-white"
              >
                Fermer
              </button>
            </header>

            <div className="overflow-y-auto p-6">
              {isLoading && (
                <div className="py-16 text-center text-zinc-400">
                  Chargement de la bibliothèque…
                </div>
              )}

              {!isLoading && error && (
                <div className="rounded-xl border border-red-900 bg-red-950/40 px-5 py-4 text-red-300">
                  {error}
                </div>
              )}

              {!isLoading && !error && media.length === 0 && (
                <div className="rounded-xl border border-dashed border-zinc-700 px-6 py-16 text-center">
                  <p className="font-serif text-2xl text-zinc-300">
                    Aucune image disponible
                  </p>

                  <p className="mt-3 text-zinc-500">
                    Ajoute d’abord une image dans la bibliothèque de médias.
                  </p>
                </div>
              )}

              {!isLoading && !error && media.length > 0 && (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {media.map((item) => {
                    const isSelected = item.path === value;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => selectMedia(item.path)}
                        className={`overflow-hidden rounded-xl border bg-zinc-900 text-left transition ${
                          isSelected
                            ? "border-yellow-500 ring-2 ring-yellow-500/30"
                            : "border-zinc-800 hover:border-zinc-600"
                        }`}
                      >
                        <div className="aspect-[4/3] overflow-hidden bg-zinc-800">
                          <img
                            src={item.path}
                            alt={item.alt || item.originalName}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div className="p-4">
                          <p className="truncate font-semibold text-white">
                            {item.originalName}
                          </p>

                          <p className="mt-2 truncate text-xs text-zinc-500">
                            {item.path}
                          </p>

                          {isSelected && (
                            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-yellow-500">
                              Image sélectionnée
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}