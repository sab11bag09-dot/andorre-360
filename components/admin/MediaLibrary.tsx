"use client";

import { useState } from "react";

import MediaCard from "@/components/admin/MediaCard";
import MediaDeleteButton from "@/components/admin/MediaDeleteButton";
import MediaMetadataForm from "@/components/admin/MediaMetadataForm";
import SafeImage from "@/components/SafeImage";

type MediaUsageItem = {
  id: number;
  entityType: string;
  entityId: number;
  field: string;
};

type MediaItem = {
  id: number;
  type: string;
  filename: string;
  originalName: string;
  path: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  title: string | null;
  alt: string | null;
  caption: string | null;
  credit: string | null;
  copyright: string | null;
  usages: MediaUsageItem[];
};

type ExternalVideoItem = {
  id: number;
  url: string;
  provider: string;
  title: string | null;
};

type MediaLibraryProps = {
  media: MediaItem[];
  externalVideos: ExternalVideoItem[];
};

function getThumbnailPath(item: MediaItem): string {
  if (item.path.startsWith("/api/media/files/originals/")) {
    return item.path.replace(
      "/api/media/files/originals/",
      "/api/media/files/thumbnails/",
    );
  }

  return `/api/media/files/thumbnails/${item.filename}`;
}

function getProviderLabel(provider: string): string {
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
      return provider;
  }
}

function getEntityLabel(entityType: string): string {
  switch (entityType) {
    case "ARTICLE":
      return "Article";

    default:
      return entityType;
  }
}

function getFieldLabel(field: string): string {
  switch (field) {
    case "coverImage":
      return "Image de couverture";

    default:
      return field;
  }
}
function getExternalVideoEmbedUrl(
  url: string,
  provider: string,
): string | null {
  try {
    const parsedUrl = new URL(url);

    if (provider === "YOUTUBE") {
      let videoId = "";

      if (parsedUrl.hostname.includes("youtu.be")) {
        videoId =
          parsedUrl.pathname.split("/").filter(Boolean)[0] ?? "";
      } else if (parsedUrl.pathname.startsWith("/shorts/")) {
        videoId = parsedUrl.pathname.split("/")[2] ?? "";
      } else if (parsedUrl.pathname.startsWith("/embed/")) {
        videoId = parsedUrl.pathname.split("/")[2] ?? "";
      } else {
        videoId = parsedUrl.searchParams.get("v") ?? "";
      }

      return videoId
        ? `https://www.youtube.com/embed/${videoId}`
        : null;
    }

    if (provider === "VIMEO") {
      const videoId = parsedUrl.pathname
        .split("/")
        .filter(Boolean)
        .find((part) => /^\d+$/.test(part));

      return videoId
        ? `https://player.vimeo.com/video/${videoId}`
        : null;
    }

    if (provider === "TIKTOK") {
      const match = parsedUrl.pathname.match(/\/video\/(\d+)/);
      const videoId = match?.[1];

      return videoId
        ? `https://www.tiktok.com/player/v1/${videoId}`
        : null;
    }

    if (provider === "FACEBOOK") {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
        url,
      )}&show_text=false`;
    }

    return null;
  } catch {
    return null;
  }
}

function formatFileSize(size: number): string {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} Mo`;
  }

  return `${(size / 1024).toFixed(1)} Ko`;
}

function getDimensions(item: MediaItem): string {
  if (item.width && item.height) {
    return `${item.width} × ${item.height}`;
  }

  if (item.type === "VIDEO") {
    return "Vidéo";
  }

  if (item.type === "AUDIO") {
    return "Audio";
  }

  if (item.type === "DOCUMENT") {
    return "Document";
  }

  return "Dimensions inconnues";
}

export default function MediaLibrary({
  media,
  externalVideos,
}: MediaLibraryProps) {
  const [selectedMediaId, setSelectedMediaId] = useState<number | null>(
    media[0]?.id ?? null,
  );

  const selectedMedia =
    media.find((item) => item.id === selectedMediaId) ?? null;

  return (
    <div className="space-y-10">
      {externalVideos.length > 0 && (
        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">
                Vidéos externes
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                {externalVideos.length} vidéo
                {externalVideos.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {externalVideos.map((video) => {
              const providerLabel = getProviderLabel(
                video.provider,
              );

              const embedUrl = getExternalVideoEmbedUrl(
                video.url,
                video.provider,
              );

              const videoTitle =
                video.title || `Vidéo ${providerLabel}`;

              return (
                <MediaCard
                  key={`external-${video.id}`}
                  compact
                >
                  <div className="relative aspect-video bg-black">
                    {embedUrl ? (
                      <iframe
                        src={embedUrl}
                        title={videoTitle}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        loading="lazy"
                        className="absolute inset-0 h-full w-full border-0"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center p-6 text-center text-sm text-zinc-400">
                        Aperçu indisponible
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <h3
                        className="truncate text-sm font-medium"
                        title={videoTitle}
                      >
                        {videoTitle}
                      </h3>

                      <span className="shrink-0 rounded-full border border-zinc-700 px-2 py-0.5 text-[11px] text-zinc-400">
                        {providerLabel}
                      </span>
                    </div>

                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex text-xs font-medium text-yellow-400 transition hover:text-yellow-300"
                    >
                      Ouvrir la vidéo
                    </a>
                  </div>
                </MediaCard>
              );
            })}
          </div>
        </section>
      )}

      {media.length > 0 && (
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">
              Fichiers téléversés
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Sélectionne un média pour consulter et modifier ses
              informations.
            </p>
          </div>

          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {media.map((item) => {
                const thumbnailPath = getThumbnailPath(item);
                const isSelected =
                  item.id === selectedMedia?.id;

                return (
                  <div
                    key={`media-${item.id}`}
                    className={
                      isSelected
                        ? "rounded-xl ring-2 ring-yellow-500 ring-offset-2 ring-offset-black"
                        : ""
                    }
                  >
                    <MediaCard
                      compact
                      onClick={() =>
                        setSelectedMediaId(item.id)
                      }
                    >
                      <div className="group relative aspect-[4/3] overflow-hidden bg-zinc-900">
                        {item.type === "VIDEO" ? (
                          <video
                            src={item.path}
                            muted
                            preload="metadata"
                            className="h-full w-full object-cover"
                          />
                        ) : item.type === "IMAGE" ? (
                          <SafeImage
                            src={thumbnailPath}
                            alt={item.alt || item.originalName}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                            className="object-cover transition duration-300 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center p-6 text-center text-sm text-zinc-400">
                            {item.type}
                          </div>
                        )}

                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent p-3 pt-10">
                          <p
                            className="truncate text-sm font-medium text-white"
                            title={item.originalName}
                          >
                            {item.originalName}
                          </p>

                          <div className="mt-1 flex items-center justify-between gap-3 text-[11px] text-zinc-300">
                            <span>{formatFileSize(item.size)}</span>
                            <span>{getDimensions(item)}</span>
                          </div>
                        </div>
                      </div>
                    </MediaCard>
                  </div>
                );
              })}
            </div>

            <aside className="xl:sticky xl:top-6">
              {selectedMedia ? (
                <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
                  <div className="relative aspect-[4/3] bg-zinc-900">
                    {selectedMedia.type === "VIDEO" ? (
                      <video
                        src={selectedMedia.path}
                        controls
                        preload="metadata"
                        className="h-full w-full object-contain"
                      />
                    ) : selectedMedia.type === "IMAGE" ? (
                      <SafeImage
                        src={getThumbnailPath(selectedMedia)}
                        alt={
                          selectedMedia.alt ||
                          selectedMedia.originalName
                        }
                        fill
                        sizes="360px"
                        className="object-contain"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center p-6 text-center text-sm text-zinc-400">
                        Aperçu indisponible
                      </div>
                    )}
                  </div>

                  <div className="space-y-5 p-5">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.16em] text-yellow-400">
                        Média sélectionné
                      </p>

                      <h3
                        className="mt-2 break-words text-lg font-semibold"
                        title={selectedMedia.originalName}
                      >
                        {selectedMedia.originalName}
                      </h3>

                      <p className="mt-1 break-all text-xs text-zinc-500">
                        {selectedMedia.path}
                      </p>
                    </div>

                    <dl className="grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-lg bg-zinc-900 p-3">
                        <dt className="text-xs text-zinc-500">
                          Type
                        </dt>
                        <dd className="mt-1 font-medium">
                          {selectedMedia.type}
                        </dd>
                      </div>

                      <div className="rounded-lg bg-zinc-900 p-3">
                        <dt className="text-xs text-zinc-500">
                          Taille
                        </dt>
                        <dd className="mt-1 font-medium">
                          {formatFileSize(selectedMedia.size)}
                        </dd>
                      </div>

                      <div className="rounded-lg bg-zinc-900 p-3">
                        <dt className="text-xs text-zinc-500">
                          Dimensions
                        </dt>
                        <dd className="mt-1 font-medium">
                          {getDimensions(selectedMedia)}
                        </dd>
                      </div>

                      <div className="rounded-lg bg-zinc-900 p-3">
                        <dt className="text-xs text-zinc-500">
                          Format
                        </dt>
                        <dd
                          className="mt-1 truncate font-medium"
                          title={selectedMedia.mimeType}
                        >
                          {selectedMedia.mimeType}
                        </dd>
                      </div>
                    </dl>

                    <a
                      href={selectedMedia.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex text-sm font-medium text-yellow-400 transition hover:text-yellow-300"
                    >
                      Ouvrir le fichier original
                    </a>

                    <MediaMetadataForm
                      key={`metadata-${selectedMedia.id}`}
                      mediaId={selectedMedia.id}
                      initialAlt={selectedMedia.alt}
                      initialCaption={selectedMedia.caption}
                      initialTitle={selectedMedia.title}
initialCredit={selectedMedia.credit}
initialCopyright={selectedMedia.copyright}
                    />

                   <div className="rounded-lg bg-zinc-900 p-4">
  <h4 className="text-sm font-semibold">Utilisations</h4>

  <p className="mt-2 text-sm text-zinc-400">
    {selectedMedia.usages.length} utilisation
    {selectedMedia.usages.length > 1 ? "s" : ""}
  </p>
  {selectedMedia.usages.length === 0 && (
  <p className="mt-2 text-xs text-zinc-500">
    Ce média n’est utilisé nulle part.
  </p>
)}
{selectedMedia.usages.length > 0 && (
  <div className="mt-3 space-y-2">
    {selectedMedia.usages.map((usage) => (
      <div
        key={usage.id}
        className="rounded-md border border-zinc-800 p-3 text-xs"
      >
        <p className="font-medium text-zinc-200">
          {getEntityLabel(usage.entityType)}
        </p>

        <p className="mt-1 text-zinc-500">
          Élément #{usage.entityId} · Champ : {getFieldLabel(usage.field)}
        </p>
      </div>
    ))}
  </div>
)}
</div>

                    <MediaDeleteButton
                      key={`delete-${selectedMedia.id}`}
                      mediaId={selectedMedia.id}
                      mediaName={selectedMedia.originalName}
                    />
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-500">
                  Sélectionne un média dans la grille.
                </div>
              )}
            </aside>
          </div>
        </section>
      )}
    </div>
  );
}