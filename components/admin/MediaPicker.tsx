"use client";

import { useEffect, useMemo, useState } from "react";

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

type ExternalVideoItem = {
  id: number;
  url: string;
  provider: "YOUTUBE" | "VIMEO" | "TIKTOK" | "FACEBOOK";
  title: string | null;
  createdAt: string;
};

type MediaPickerProps = {
  value: string;
  onChange: (path: string) => void;
  type?: "image" | "video";
};

function getProviderLabel(provider: ExternalVideoItem["provider"]) {
  switch (provider) {
    case "YOUTUBE":
      return "YouTube";
    case "VIMEO":
      return "Vimeo";
    case "TIKTOK":
      return "TikTok";
    case "FACEBOOK":
      return "Facebook";
    default:
      return "Vidéo externe";
  }
}

export default function MediaPicker({
  value,
  onChange,
  type = "image",
}: MediaPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [externalVideos, setExternalVideos] = useState<
    ExternalVideoItem[]
  >([]);
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
        if (type === "image") {
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
          setExternalVideos([]);
          return;
        }

        const [mediaResponse, externalVideosResponse] =
          await Promise.all([
            fetch("/api/media"),
            fetch("/api/external-videos"),
          ]);

        const mediaData = (await mediaResponse.json()) as {
          media?: MediaItem[];
          error?: string;
        };

        const externalVideosData =
          (await externalVideosResponse.json()) as {
            externalVideos?: ExternalVideoItem[];
            error?: string;
          };

        if (!mediaResponse.ok) {
          throw new Error(
            mediaData.error || "Impossible de charger les médias.",
          );
        }

        if (!externalVideosResponse.ok) {
          throw new Error(
            externalVideosData.error ||
              "Impossible de charger les vidéos externes.",
          );
        }

        setMedia(mediaData.media || []);
        setExternalVideos(
          externalVideosData.externalVideos || [],
        );
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
  }, [isOpen, type]);

  const filteredMedia = useMemo(() => {
    if (type === "image") {
      return media.filter((item) =>
        item.mimeType.startsWith("image/"),
      );
    }

    return media.filter((item) =>
      item.mimeType.startsWith("video/"),
    );
  }, [media, type]);

  const hasItems =
    filteredMedia.length > 0 ||
    (type === "video" && externalVideos.length > 0);

  function selectMedia(path: string) {
    onChange(path);
    setIsOpen(false);
  }

  const singularLabel = type === "image" ? "image" : "vidéo";
  const pluralLabel = type === "image" ? "images" : "vidéos";

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center justify-center rounded-lg bg-yellow-500 px-5 py-3 font-semibold text-black transition hover:bg-yellow-400"
        >
          Choisir une {singularLabel}
        </button>

        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="inline-flex items-center justify-center rounded-lg border border-zinc-700 px-5 py-3 font-semibold text-zinc-300 transition hover:border-red-500 hover:text-red-400"
          >
            Retirer la {singularLabel}
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
                  Choisir une {singularLabel}
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

              {!isLoading && !error && !hasItems && (
                <div className="rounded-xl border border-dashed border-zinc-700 px-6 py-16 text-center">
                  <p className="font-serif text-2xl text-zinc-300">
                    Aucune {singularLabel} disponible
                  </p>

                  <p className="mt-3 text-zinc-500">
                    Ajoute d’abord une {singularLabel} dans la
                    bibliothèque de médias.
                  </p>
                </div>
              )}

              {!isLoading && !error && hasItems && (
                <div className="space-y-8">
                  {filteredMedia.length > 0 && (
                    <div>
                      <h3 className="mb-4 font-serif text-xl text-white">
                        {type === "image"
                          ? "Images téléversées"
                          : "Vidéos téléversées"}
                      </h3>

                      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredMedia.map((item) => {
                          const isSelected = item.path === value;

                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() =>
                                selectMedia(item.path)
                              }
                              className={`overflow-hidden rounded-xl border bg-zinc-900 text-left transition ${
                                isSelected
                                  ? "border-yellow-500 ring-2 ring-yellow-500/30"
                                  : "border-zinc-800 hover:border-zinc-600"
                              }`}
                            >
                              <div className="aspect-[4/3] overflow-hidden bg-zinc-800">
                                {type === "image" ? (
                                  <img
                                    src={item.path}
                                    alt={
                                      item.alt ||
                                      item.originalName
                                    }
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <video
                                    src={item.path}
                                    className="h-full w-full object-cover"
                                    muted
                                    preload="metadata"
                                  />
                                )}
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
                                    {type === "image"
                                      ? "Image sélectionnée"
                                      : "Vidéo sélectionnée"}
                                  </p>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {type === "video" &&
                    externalVideos.length > 0 && (
                      <div>
                        <h3 className="mb-4 font-serif text-xl text-white">
                          Vidéos externes
                        </h3>

                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                          {externalVideos.map((item) => {
                            const isSelected =
                              item.url === value;

                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() =>
                                  selectMedia(item.url)
                                }
                                className={`overflow-hidden rounded-xl border bg-zinc-900 text-left transition ${
                                  isSelected
                                    ? "border-yellow-500 ring-2 ring-yellow-500/30"
                                    : "border-zinc-800 hover:border-zinc-600"
                                }`}
                              >
                                <div className="flex aspect-[4/3] items-center justify-center bg-zinc-800 px-4 text-center">
                                  <div>
                                    <p className="font-serif text-2xl text-white">
                                      {getProviderLabel(
                                        item.provider,
                                      )}
                                    </p>

                                    <p className="mt-2 text-sm text-zinc-400">
                                      Vidéo externe
                                    </p>
                                  </div>
                                </div>

                                <div className="p-4">
                                  <p className="truncate font-semibold text-white">
                                    {item.title ||
                                      getProviderLabel(
                                        item.provider,
                                      )}
                                  </p>

                                  <p className="mt-2 truncate text-xs text-zinc-500">
                                    {item.url}
                                  </p>

                                  {isSelected && (
                                    <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-yellow-500">
                                      Vidéo sélectionnée
                                    </p>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}