import SafeImage from "@/components/SafeImage";

type MediaPreviewProps = {
  image: string | null;
  videoUrl: string | null;
  title: string;
  mode?: "featured" | "thumbnail";
};

function getVideoEmbedUrl(url: string): string | null {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();

    if (hostname.includes("youtube.com")) {
      const videoId = parsedUrl.searchParams.get("v");
      return videoId
        ? `https://www.youtube.com/embed/${videoId}`
        : null;
    }

    if (hostname.includes("youtu.be")) {
      const videoId = parsedUrl.pathname
        .split("/")
        .filter(Boolean)[0];

      return videoId
        ? `https://www.youtube.com/embed/${videoId}`
        : null;
    }

    if (hostname.includes("vimeo.com")) {
      const videoId = parsedUrl.pathname
        .split("/")
        .filter(Boolean)
        .find((part) => /^\d+$/.test(part));

      return videoId
        ? `https://player.vimeo.com/video/${videoId}`
        : null;
    }

    return null;
  } catch {
    return null;
  }
}

export default function MediaPreview({
  image,
  videoUrl,
  title,
  mode = "thumbnail",
}: MediaPreviewProps) {
  const videoEmbedUrl = videoUrl
    ? getVideoEmbedUrl(videoUrl)
    : null;

  const isFeatured = mode === "featured";

  return (
    <div className="relative h-full w-full overflow-hidden bg-zinc-900">
      {isFeatured && videoEmbedUrl ? (
        <iframe
          src={videoEmbedUrl}
          title={`Vidéo : ${title}`}
          className="h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <>
          <SafeImage
            src={image || "/images/global/hero.jpg"}
            alt={title}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />

          {!isFeatured && videoUrl && (
            <span className="absolute bottom-3 left-3 rounded bg-black/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-yellow-400">
              Vidéo
            </span>
          )}
        </>
      )}
    </div>
  );
}
