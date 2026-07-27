import ExternalVideoButton from "@/components/admin/ExternalVideoButton";
import MediaCard from "@/components/admin/MediaCard";
import MediaDeleteButton from "@/components/admin/MediaDeleteButton";
import MediaMetadataForm from "@/components/admin/MediaMetadataForm";
import MediaSearch from "@/components/admin/MediaSearch";
import MediaUploadButton from "@/components/admin/MediaUploadButton";
import {
  EmptyState,
  PageHeader,
  SectionHeader,
  Toolbar,
} from "@/components/admin/ui";
import SafeImage from "@/components/SafeImage";
import { prisma } from "@/lib/prisma";

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

type AdminMediaPageProps = {
  searchParams: Promise<{
    recherche?: string;
  }>;
};

export default async function AdminMediaPage({
  searchParams,
}: AdminMediaPageProps) {
  const { recherche = "" } = await searchParams;
  const normalizedSearch = recherche.trim();
  const lowercaseSearch = normalizedSearch.toLowerCase();

  const [media, externalVideos] = await Promise.all([
    prisma.media.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.externalVideo.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  const totalMedia = media.length + externalVideos.length;

  const filteredMedia = normalizedSearch
    ? media.filter((item) => {
        return (
          item.originalName
            .toLowerCase()
            .includes(lowercaseSearch) ||
          item.filename.toLowerCase().includes(lowercaseSearch) ||
          item.path.toLowerCase().includes(lowercaseSearch) ||
          (item.alt ?? "")
            .toLowerCase()
            .includes(lowercaseSearch) ||
          (item.caption ?? "")
            .toLowerCase()
            .includes(lowercaseSearch)
        );
      })
    : media;

  const filteredExternalVideos = normalizedSearch
    ? externalVideos.filter((video) => {
        return (
          (video.title ?? "")
            .toLowerCase()
            .includes(lowercaseSearch) ||
          video.url.toLowerCase().includes(lowercaseSearch) ||
          video.provider.toLowerCase().includes(lowercaseSearch)
        );
      })
    : externalVideos;

  const filteredTotal =
    filteredMedia.length + filteredExternalVideos.length;

  return (
    <>
      <PageHeader
        backHref="/admin"
        backLabel="Retour au Studio"
        eyebrow="ANDORRE 360 Studio"
        title="Bibliothèque de médias"
        description="Téléverse, consulte et réutilise les images et vidéos de ton journal."
      />

      <section className="py-8">
        <SectionHeader
          title="Médias"
          description={`${filteredTotal} média${
            filteredTotal > 1 ? "s" : ""
          }`}
        />

        <Toolbar
          search={
            <MediaSearch initialQuery={normalizedSearch} />
          }
          actions={
            <>
              <MediaUploadButton />
              <ExternalVideoButton />
            </>
          }
        />

        {totalMedia === 0 ? (
          <EmptyState
            title="Aucun média dans la bibliothèque"
            description="Téléverse un fichier ou ajoute une vidéo externe pour commencer."
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <MediaUploadButton />
                <ExternalVideoButton />
              </div>
            }
          />
        ) : filteredTotal === 0 ? (
          <EmptyState
            title="Aucun résultat"
            description={`Aucun média ne correspond à « ${normalizedSearch} ».`}
          />
        ) : (
          <div className="space-y-10">
            {filteredExternalVideos.length > 0 && (
              <div>
                <h2 className="mb-4 text-lg font-semibold">
                  Vidéos externes
                </h2>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredExternalVideos.map((video) => {
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
                            <div className="flex h-full items-center justify-center p-6 text-center text-sm text-gray-400">
                              Aperçu indisponible
                            </div>
                          )}
                        </div>

                        <div className="space-y-3 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <h3
                              className="truncate font-medium"
                              title={videoTitle}
                            >
                              {videoTitle}
                            </h3>

                            <span className="shrink-0 rounded-full border border-gray-700 px-2 py-1 text-xs text-gray-400">
                              {providerLabel}
                            </span>
                          </div>

                          <p
                            className="truncate text-xs text-gray-500"
                            title={video.url}
                          >
                            {video.url}
                          </p>

                          <a
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex text-sm font-medium text-yellow-400 transition hover:text-yellow-300"
                          >
                            Ouvrir sur {providerLabel}
                          </a>
                        </div>
                      </MediaCard>
                    );
                  })}
                </div>
              </div>
            )}

            {filteredMedia.length > 0 && (
              <div>
                <h2 className="mb-4 text-lg font-semibold">
                  Fichiers téléversés
                </h2>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredMedia.map((item) => {
                    const imageSrc = item.path.startsWith(
                      "/api/media/files/originals/",
                    )
                      ? item.path.replace(
                          "/api/media/files/originals/",
                          "/api/media/files/thumbnails/",
                        )
                      : `/api/media/files/thumbnails/${item.filename}`;

                    return (
                      <MediaCard key={`media-${item.id}`}>
                        <div className="relative aspect-[4/3] bg-zinc-900">
                          {item.type === "VIDEO" ? (
                            <video
                              src={item.path}
                              controls
                              preload="metadata"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <a
                              href={item.path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="relative block h-full w-full cursor-zoom-in"
                              aria-label={`Ouvrir ${item.originalName}`}
                              title="Ouvrir l’image originale"
                            >
                              <SafeImage
                                src={imageSrc}
                                alt={
                                  item.alt ||
                                  item.originalName
                                }
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                className="object-cover"
                              />
                            </a>
                          )}
                        </div>

                        <div className="space-y-4 p-4">
                          <div className="space-y-2">
                            <h3
                              className="truncate font-medium"
                              title={item.originalName}
                            >
                              {item.originalName}
                            </h3>

                            <p
                              className="truncate text-xs text-gray-500"
                              title={item.path}
                            >
                              {item.path}
                            </p>

                            <div className="flex items-center justify-between gap-3 text-xs text-gray-500">
                              <span>
                                {(item.size / 1024).toFixed(1)} Ko
                              </span>

                              <span className="text-right">
                                {item.width && item.height
                                  ? `${item.width} × ${item.height}`
                                  : item.type === "VIDEO"
                                    ? "Vidéo"
                                    : "Dimensions inconnues"}
                              </span>
                            </div>
                          </div>

                          <MediaMetadataForm
                            mediaId={item.id}
                            initialAlt={item.alt}
                            initialCaption={item.caption}
                          />

                          <MediaDeleteButton
                            mediaId={item.id}
                            mediaName={item.originalName}
                          />
                        </div>
                      </MediaCard>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </>
  );
}